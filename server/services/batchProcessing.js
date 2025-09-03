import { logger } from '../utils/logger.js';
import PayoutBatch from '../models/PayoutBatch.js';
import Payout from '../models/Payout.js';
import { sendSol, sendToken } from './solana.js';
import { getFeeRecommendations } from './feeManagement.js';
import crypto from 'crypto';

/**
 * Process a payout batch
 * @param {string} batchId - Batch ID to process
 * @returns {Promise<Object>} - Processing result
 */
export const processBatch = async (batchId) => {
  try {
    // Get batch with payouts
    const batch = await PayoutBatch.findOne({ batchId }).populate('payouts');
    
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }
    
    // Check if batch can be processed
    if (!['created', 'scheduled'].includes(batch.status)) {
      throw new Error(`Batch ${batchId} cannot be processed (status: ${batch.status})`);
    }
    
    // Update batch status
    batch.status = 'processing';
    await batch.save();
    
    logger.info(`Processing payout batch ${batchId} with ${batch.recipientCount} recipients`);
    
    // Get payouts for this batch
    const payouts = await Payout.find({ batch: batch._id });
    
    // Get optimal fee recommendations
    const feeRecommendations = await getFeeRecommendations();
    
    // Process each payout
    const results = await Promise.allSettled(
      payouts.map(payout => processPayout(payout, feeRecommendations))
    );
    
    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    // Update batch status
    if (failed === 0) {
      batch.status = 'completed';
      batch.completedAt = new Date();
    } else if (successful === 0) {
      batch.status = 'failed';
    } else {
      batch.status = 'completed_with_errors';
    }
    
    await batch.save();
    
    logger.info(`Batch ${batchId} processing completed: ${successful} successful, ${failed} failed`);
    
    return {
      batchId,
      status: batch.status,
      successful,
      failed,
      total: payouts.length
    };
  } catch (error) {
    logger.error(`Error processing batch ${batchId}: ${error.message}`);
    
    // Update batch status to failed
    try {
      await PayoutBatch.findOneAndUpdate(
        { batchId },
        { status: 'failed' }
      );
    } catch (updateError) {
      logger.error(`Error updating batch status: ${updateError.message}`);
    }
    
    throw new Error(`Failed to process batch ${batchId}: ${error.message}`);
  }
};

/**
 * Process a single payout
 * @param {Object} payout - Payout to process
 * @param {Object} feeRecommendations - Fee recommendations
 * @returns {Promise<Object>} - Processing result
 */
const processPayout = async (payout, feeRecommendations) => {
  try {
    // Update payout status
    payout.status = 'processing';
    payout.estimatedFee = feeRecommendations.standard;
    await payout.save();
    
    let signature;
    
    // Process based on token type
    if (payout.token === 'SOL') {
      // Send SOL
      signature = await sendSol(
        payout.recipientAddress,
        payout.amount
      );
    } else {
      // Send SPL token (would need token mint address and decimals)
      // This is simplified - in a real implementation, you'd store token details
      throw new Error('SPL token payouts not implemented');
    }
    
    // Update payout with success
    payout.status = 'completed';
    payout.signature = signature;
    payout.actualFee = feeRecommendations.standard; // In a real implementation, get actual fee from transaction
    await payout.save();
    
    logger.info(`Payout ${payout.payoutId} completed successfully: ${signature}`);
    
    return {
      payoutId: payout.payoutId,
      status: 'completed',
      signature
    };
  } catch (error) {
    logger.error(`Error processing payout ${payout.payoutId}: ${error.message}`);
    
    // Update payout with failure
    payout.status = 'failed';
    payout.failureReason = error.message;
    payout.retryCount += 1;
    await payout.save();
    
    throw new Error(`Failed to process payout ${payout.payoutId}: ${error.message}`);
  }
};

/**
 * Create a new payout batch
 * @param {Object} batchData - Batch data
 * @param {Object} user - User creating the batch
 * @returns {Promise<Object>} - Created batch
 */
export const createPayoutBatch = async (batchData, user) => {
  try {
    const { name, recipients, token = 'SOL' } = batchData;
    
    // Validate recipients
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new Error('Recipients must be a non-empty array');
    }
    
    // Calculate total amount
    const totalAmount = recipients.reduce((sum, recipient) => sum + recipient.amount, 0);
    
    // Create batch
    const batch = new PayoutBatch({
      user: user._id,
      batchId: `batch_${crypto.randomBytes(8).toString('hex')}`,
      name,
      totalAmount,
      token,
      recipientCount: recipients.length,
      status: 'created'
    });
    
    await batch.save();
    
    // Create individual payouts
    const payouts = recipients.map(recipient => ({
      batch: batch._id,
      user: user._id,
      payoutId: `pay_${crypto.randomBytes(8).toString('hex')}`,
      recipientAddress: recipient.address,
      amount: recipient.amount,
      token,
      status: 'pending'
    }));
    
    await Payout.insertMany(payouts);
    
    logger.info(`Created payout batch ${batch.batchId} with ${recipients.length} recipients`);
    
    return batch;
  } catch (error) {
    logger.error(`Error creating payout batch: ${error.message}`);
    throw new Error(`Failed to create payout batch: ${error.message}`);
  }
};

/**
 * Schedule a payout batch for future execution
 * @param {string} batchId - Batch ID to schedule
 * @param {Date} scheduledDate - Date to schedule for
 * @param {Object} recurringOptions - Options for recurring payouts
 * @returns {Promise<Object>} - Updated batch
 */
export const scheduleBatch = async (batchId, scheduledDate, recurringOptions = null) => {
  try {
    const batch = await PayoutBatch.findOne({ batchId });
    
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }
    
    if (batch.status !== 'created') {
      throw new Error(`Batch ${batchId} cannot be scheduled (status: ${batch.status})`);
    }
    
    // Update batch with schedule
    batch.status = 'scheduled';
    batch.scheduledFor = scheduledDate;
    
    // Set recurring options if provided
    if (recurringOptions) {
      batch.isRecurring = true;
      batch.recurringSchedule = recurringOptions.schedule;
      batch.nextScheduledDate = scheduledDate;
    }
    
    await batch.save();
    
    logger.info(`Scheduled payout batch ${batchId} for ${scheduledDate}`);
    
    return batch;
  } catch (error) {
    logger.error(`Error scheduling batch ${batchId}: ${error.message}`);
    throw new Error(`Failed to schedule batch ${batchId}: ${error.message}`);
  }
};

