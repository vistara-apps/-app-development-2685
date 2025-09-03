import PayoutBatch from '../models/PayoutBatch.js';
import Payout from '../models/Payout.js';
import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { createPayoutBatch, processBatch, scheduleBatch } from '../services/batchProcessing.js';
import { isValidSolanaAddress } from '../services/solana.js';

/**
 * @desc    Create a new payout batch
 * @route   POST /api/payouts/batch
 * @access  Private (API Key)
 */
export const createPayoutBatch = async (req, res, next) => {
  try {
    const { name, recipients, token = 'SOL' } = req.body;
    
    // Validate name
    if (!name) {
      return next(new ApiError('Batch name is required', 400));
    }
    
    // Validate recipients
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return next(new ApiError('Recipients must be a non-empty array', 400));
    }
    
    // Validate each recipient
    for (const recipient of recipients) {
      if (!recipient.address || !recipient.amount) {
        return next(new ApiError('Each recipient must have an address and amount', 400));
      }
      
      if (!isValidSolanaAddress(recipient.address)) {
        return next(new ApiError(`Invalid recipient address: ${recipient.address}`, 400));
      }
      
      if (recipient.amount <= 0) {
        return next(new ApiError('Amount must be greater than 0', 400));
      }
    }
    
    // Create batch
    const batch = await createPayoutBatch({ name, recipients, token }, req.user);
    
    // Send response
    res.status(201).json({
      success: true,
      data: batch
    });
  } catch (error) {
    logger.error(`Error creating payout batch: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all payout batches for a user
 * @route   GET /api/payouts/batch
 * @access  Private (API Key)
 */
export const getPayoutBatches = async (req, res, next) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Build query
    const query = { user: req.user._id };
    
    // Add filters if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.token) {
      query.token = req.query.token;
    }
    
    // Get total count
    const total = await PayoutBatch.countDocuments(query);
    
    // Get batches
    const batches = await PayoutBatch.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // Prepare pagination
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };
    
    // Send response
    res.status(200).json({
      success: true,
      pagination,
      data: batches
    });
  } catch (error) {
    logger.error(`Error getting payout batches: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get payout batch by ID
 * @route   GET /api/payouts/batch/:id
 * @access  Private (API Key)
 */
export const getPayoutBatchById = async (req, res, next) => {
  try {
    const batch = await PayoutBatch.findOne({
      user: req.user._id,
      batchId: req.params.id
    });
    
    if (!batch) {
      return next(new ApiError('Payout batch not found', 404));
    }
    
    // Send response
    res.status(200).json({
      success: true,
      data: batch
    });
  } catch (error) {
    logger.error(`Error getting payout batch: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update payout batch
 * @route   PUT /api/payouts/batch/:id
 * @access  Private (API Key)
 */
export const updatePayoutBatch = async (req, res, next) => {
  try {
    const batch = await PayoutBatch.findOne({
      user: req.user._id,
      batchId: req.params.id
    });
    
    if (!batch) {
      return next(new ApiError('Payout batch not found', 404));
    }
    
    // Check if batch can be updated
    if (!['created'].includes(batch.status)) {
      return next(new ApiError(`Batch cannot be updated (status: ${batch.status})`, 400));
    }
    
    // Update fields
    if (req.body.name) {
      batch.name = req.body.name;
    }
    
    // Save batch
    await batch.save();
    
    // Send response
    res.status(200).json({
      success: true,
      data: batch
    });
  } catch (error) {
    logger.error(`Error updating payout batch: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Cancel payout batch
 * @route   DELETE /api/payouts/batch/:id
 * @access  Private (API Key)
 */
export const cancelPayoutBatch = async (req, res, next) => {
  try {
    const batch = await PayoutBatch.findOne({
      user: req.user._id,
      batchId: req.params.id
    });
    
    if (!batch) {
      return next(new ApiError('Payout batch not found', 404));
    }
    
    // Check if batch can be cancelled
    if (!['created', 'scheduled'].includes(batch.status)) {
      return next(new ApiError(`Batch cannot be cancelled (status: ${batch.status})`, 400));
    }
    
    // Update status
    batch.status = 'cancelled';
    await batch.save();
    
    // Send response
    res.status(200).json({
      success: true,
      data: {
        message: `Batch ${batch.batchId} cancelled successfully`,
        batch
      }
    });
  } catch (error) {
    logger.error(`Error cancelling payout batch: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Schedule a payout batch
 * @route   POST /api/payouts/batch/:id/schedule
 * @access  Private (API Key)
 */
export const schedulePayoutBatch = async (req, res, next) => {
  try {
    const { scheduledDate, isRecurring, recurringSchedule } = req.body;
    
    // Validate scheduled date
    if (!scheduledDate) {
      return next(new ApiError('Scheduled date is required', 400));
    }
    
    const scheduleDate = new Date(scheduledDate);
    
    if (isNaN(scheduleDate.getTime())) {
      return next(new ApiError('Invalid scheduled date format', 400));
    }
    
    // Get batch
    const batch = await PayoutBatch.findOne({
      user: req.user._id,
      batchId: req.params.id
    });
    
    if (!batch) {
      return next(new ApiError('Payout batch not found', 404));
    }
    
    // Check if batch can be scheduled
    if (batch.status !== 'created') {
      return next(new ApiError(`Batch cannot be scheduled (status: ${batch.status})`, 400));
    }
    
    // Prepare recurring options
    const recurringOptions = isRecurring ? { schedule: recurringSchedule } : null;
    
    // Schedule batch
    await scheduleBatch(batch.batchId, scheduleDate, recurringOptions);
    
    // Get updated batch
    const updatedBatch = await PayoutBatch.findOne({
      batchId: batch.batchId
    });
    
    // Send response
    res.status(200).json({
      success: true,
      data: {
        message: `Batch ${batch.batchId} scheduled successfully for ${scheduleDate}`,
        batch: updatedBatch
      }
    });
  } catch (error) {
    logger.error(`Error scheduling payout batch: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all payouts in a batch
 * @route   GET /api/payouts/batch/:id/payouts
 * @access  Private (API Key)
 */
export const getPayoutsByBatchId = async (req, res, next) => {
  try {
    // Check if batch exists and belongs to user
    const batch = await PayoutBatch.findOne({
      user: req.user._id,
      batchId: req.params.id
    });
    
    if (!batch) {
      return next(new ApiError('Payout batch not found', 404));
    }
    
    // Get payouts
    const payouts = await Payout.find({ batch: batch._id });
    
    // Send response
    res.status(200).json({
      success: true,
      data: {
        batch,
        payouts
      }
    });
  } catch (error) {
    logger.error(`Error getting payouts for batch: ${error.message}`);
    next(error);
  }
};

