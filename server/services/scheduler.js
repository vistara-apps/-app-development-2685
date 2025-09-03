import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import PayoutBatch from '../models/PayoutBatch.js';
import { processBatch } from './batchProcessing.js';
import { getNetworkStatistics } from './feeManagement.js';

// Store scheduled tasks
const scheduledTasks = new Map();

/**
 * Initialize scheduler
 */
export const initScheduler = () => {
  // Schedule network statistics update (every 15 minutes)
  cron.schedule('*/15 * * * *', async () => {
    try {
      await getNetworkStatistics();
      logger.info('Network statistics updated by scheduler');
    } catch (error) {
      logger.error(`Scheduled network stats update failed: ${error.message}`);
    }
  });
  
  // Schedule batch processing check (every minute)
  cron.schedule('* * * * *', async () => {
    try {
      await checkScheduledBatches();
    } catch (error) {
      logger.error(`Scheduled batch check failed: ${error.message}`);
    }
  });
  
  // Schedule recurring batch check (every hour)
  cron.schedule('0 * * * *', async () => {
    try {
      await checkRecurringBatches();
    } catch (error) {
      logger.error(`Recurring batch check failed: ${error.message}`);
    }
  });
  
  logger.info('Scheduler initialized');
};

/**
 * Check for scheduled batches that need to be processed
 */
const checkScheduledBatches = async () => {
  try {
    // Find batches scheduled for now or earlier
    const batchesToProcess = await PayoutBatch.find({
      status: 'scheduled',
      scheduledFor: { $lte: new Date() }
    });
    
    if (batchesToProcess.length === 0) {
      return;
    }
    
    logger.info(`Found ${batchesToProcess.length} scheduled batches to process`);
    
    // Process each batch
    for (const batch of batchesToProcess) {
      try {
        await processBatch(batch.batchId);
      } catch (error) {
        logger.error(`Error processing scheduled batch ${batch.batchId}: ${error.message}`);
      }
    }
  } catch (error) {
    logger.error(`Error checking scheduled batches: ${error.message}`);
  }
};

/**
 * Check for recurring batches that need to be rescheduled
 */
const checkRecurringBatches = async () => {
  try {
    // Find completed recurring batches with next scheduled date in the past
    const recurringBatches = await PayoutBatch.find({
      isRecurring: true,
      status: 'completed',
      nextScheduledDate: { $lte: new Date() }
    });
    
    if (recurringBatches.length === 0) {
      return;
    }
    
    logger.info(`Found ${recurringBatches.length} recurring batches to reschedule`);
    
    // Process each recurring batch
    for (const batch of recurringBatches) {
      try {
        await createRecurringBatchInstance(batch);
      } catch (error) {
        logger.error(`Error creating recurring batch instance for ${batch.batchId}: ${error.message}`);
      }
    }
  } catch (error) {
    logger.error(`Error checking recurring batches: ${error.message}`);
  }
};

/**
 * Create a new instance of a recurring batch
 * @param {Object} originalBatch - Original batch to create new instance from
 */
const createRecurringBatchInstance = async (originalBatch) => {
  try {
    // Get payouts from original batch
    const originalPayouts = await Payout.find({ batch: originalBatch._id });
    
    if (originalPayouts.length === 0) {
      logger.error(`No payouts found for recurring batch ${originalBatch.batchId}`);
      return;
    }
    
    // Create new batch based on original
    const newBatch = new PayoutBatch({
      user: originalBatch.user,
      batchId: `batch_${crypto.randomBytes(8).toString('hex')}`,
      name: `${originalBatch.name} (Recurring)`,
      totalAmount: originalBatch.totalAmount,
      token: originalBatch.token,
      recipientCount: originalBatch.recipientCount,
      status: 'created',
      isRecurring: true,
      recurringSchedule: originalBatch.recurringSchedule
    });
    
    await newBatch.save();
    
    // Create new payouts based on original
    const newPayouts = originalPayouts.map(payout => ({
      batch: newBatch._id,
      user: payout.user,
      payoutId: `pay_${crypto.randomBytes(8).toString('hex')}`,
      recipientAddress: payout.recipientAddress,
      amount: payout.amount,
      token: payout.token,
      status: 'pending'
    }));
    
    await Payout.insertMany(newPayouts);
    
    // Calculate next scheduled date based on recurring schedule
    const nextDate = calculateNextScheduledDate(originalBatch.recurringSchedule);
    
    // Update original batch with new next scheduled date
    originalBatch.nextScheduledDate = nextDate;
    await originalBatch.save();
    
    // Schedule the new batch
    await scheduleBatch(newBatch.batchId, new Date());
    
    logger.info(`Created new recurring batch ${newBatch.batchId} from ${originalBatch.batchId}`);
  } catch (error) {
    logger.error(`Error creating recurring batch instance: ${error.message}`);
    throw error;
  }
};

/**
 * Calculate next scheduled date based on cron expression
 * @param {string} cronExpression - Cron expression for scheduling
 * @returns {Date} - Next scheduled date
 */
const calculateNextScheduledDate = (cronExpression) => {
  try {
    // Parse cron expression to get next date
    const schedule = cron.schedule(cronExpression, () => {});
    const nextDate = schedule.nextDate().toDate();
    schedule.stop();
    
    return nextDate;
  } catch (error) {
    logger.error(`Error calculating next scheduled date: ${error.message}`);
    // Default to 30 days from now if cron parsing fails
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
};

/**
 * Schedule a one-time task
 * @param {string} taskId - Unique task ID
 * @param {Date} scheduledDate - Date to run task
 * @param {Function} task - Task function to run
 */
export const scheduleTask = (taskId, scheduledDate, task) => {
  try {
    // Calculate delay in milliseconds
    const now = new Date();
    const delay = scheduledDate.getTime() - now.getTime();
    
    if (delay <= 0) {
      // Run immediately if scheduled in the past
      task();
      return;
    }
    
    // Schedule task with setTimeout
    const timeoutId = setTimeout(() => {
      task();
      scheduledTasks.delete(taskId);
    }, delay);
    
    // Store task reference
    scheduledTasks.set(taskId, {
      id: taskId,
      scheduledDate,
      timeoutId
    });
    
    logger.info(`Scheduled task ${taskId} for ${scheduledDate}`);
  } catch (error) {
    logger.error(`Error scheduling task ${taskId}: ${error.message}`);
  }
};

/**
 * Cancel a scheduled task
 * @param {string} taskId - Task ID to cancel
 */
export const cancelTask = (taskId) => {
  try {
    const task = scheduledTasks.get(taskId);
    
    if (!task) {
      logger.warn(`Task ${taskId} not found for cancellation`);
      return false;
    }
    
    // Clear timeout
    clearTimeout(task.timeoutId);
    
    // Remove from map
    scheduledTasks.delete(taskId);
    
    logger.info(`Cancelled scheduled task ${taskId}`);
    return true;
  } catch (error) {
    logger.error(`Error cancelling task ${taskId}: ${error.message}`);
    return false;
  }
};

