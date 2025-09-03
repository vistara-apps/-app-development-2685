import express from 'express';
import { apiKeyAuth } from '../middleware/auth.js';
import { 
  createPayoutBatch,
  getPayoutBatches,
  getPayoutBatchById,
  updatePayoutBatch,
  cancelPayoutBatch,
  schedulePayoutBatch,
  getPayoutsByBatchId
} from '../controllers/payoutController.js';

const router = express.Router();

/**
 * @route   POST /api/payouts/batch
 * @desc    Create a new payout batch
 * @access  Private (API Key)
 */
router.post('/batch', apiKeyAuth, createPayoutBatch);

/**
 * @route   GET /api/payouts/batch
 * @desc    Get all payout batches for a user
 * @access  Private (API Key)
 */
router.get('/batch', apiKeyAuth, getPayoutBatches);

/**
 * @route   GET /api/payouts/batch/:id
 * @desc    Get payout batch by ID
 * @access  Private (API Key)
 */
router.get('/batch/:id', apiKeyAuth, getPayoutBatchById);

/**
 * @route   PUT /api/payouts/batch/:id
 * @desc    Update payout batch
 * @access  Private (API Key)
 */
router.put('/batch/:id', apiKeyAuth, updatePayoutBatch);

/**
 * @route   DELETE /api/payouts/batch/:id
 * @desc    Cancel payout batch
 * @access  Private (API Key)
 */
router.delete('/batch/:id', apiKeyAuth, cancelPayoutBatch);

/**
 * @route   POST /api/payouts/batch/:id/schedule
 * @desc    Schedule a payout batch
 * @access  Private (API Key)
 */
router.post('/batch/:id/schedule', apiKeyAuth, schedulePayoutBatch);

/**
 * @route   GET /api/payouts/batch/:id/payouts
 * @desc    Get all payouts in a batch
 * @access  Private (API Key)
 */
router.get('/batch/:id/payouts', apiKeyAuth, getPayoutsByBatchId);

export default router;

