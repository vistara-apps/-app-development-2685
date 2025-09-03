import express from 'express';
import { apiKeyAuth } from '../middleware/auth.js';
import { getFeeRecommendations, getNetworkStats } from '../controllers/networkController.js';

const router = express.Router();

/**
 * @route   GET /api/status
 * @desc    Get API status
 * @access  Public
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    version: '1.0.0',
    timestamp: new Date()
  });
});

/**
 * @route   GET /api/network/stats
 * @desc    Get Solana network statistics
 * @access  Private (API Key)
 */
router.get('/network/stats', apiKeyAuth, getNetworkStats);

/**
 * @route   GET /api/network/fees
 * @desc    Get fee recommendations
 * @access  Private (API Key)
 */
router.get('/network/fees', apiKeyAuth, getFeeRecommendations);

export default router;

