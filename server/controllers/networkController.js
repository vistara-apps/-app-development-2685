import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { getNetworkStatistics, getFeeRecommendations } from '../services/feeManagement.js';
import NetworkStats from '../models/NetworkStats.js';

/**
 * @desc    Get Solana network statistics
 * @route   GET /api/network/stats
 * @access  Private (API Key)
 */
export const getNetworkStats = async (req, res, next) => {
  try {
    // Get latest stats from database
    let stats = await NetworkStats.findOne().sort({ timestamp: -1 });
    
    // If no stats or stats are older than 15 minutes, get fresh stats
    if (!stats || (Date.now() - stats.timestamp.getTime() > 15 * 60 * 1000)) {
      stats = await getNetworkStatistics();
    }
    
    // Send response
    res.status(200).json({
      success: true,
      data: {
        timestamp: stats.timestamp,
        averageFee: stats.averageFee,
        medianFee: stats.medianFee,
        minFee: stats.minFee,
        maxFee: stats.maxFee,
        tps: stats.tps,
        networkLoad: stats.networkLoad,
        blockHeight: stats.blockHeight,
        predictedFeeIncrease: stats.predictedFeeIncrease
      }
    });
  } catch (error) {
    logger.error(`Error getting network stats: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get fee recommendations
 * @route   GET /api/network/fees
 * @access  Private (API Key)
 */
export const getFeeRecommendationsHandler = async (req, res, next) => {
  try {
    // Get fee recommendations
    const recommendations = await getFeeRecommendations();
    
    // Send response
    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    logger.error(`Error getting fee recommendations: ${error.message}`);
    next(error);
  }
};

