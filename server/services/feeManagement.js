import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { logger } from '../utils/logger.js';
import NetworkStats from '../models/NetworkStats.js';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Get current Solana network stats
 * @returns {Promise<Object>} - Network statistics
 */
export const getNetworkStatistics = async () => {
  try {
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    
    // Get recent performance samples
    const perfSamples = await connection.getRecentPerformanceSamples(10);
    
    // Calculate TPS
    const tps = perfSamples.reduce((sum, sample) => sum + sample.numTransactions / sample.samplePeriodSecs, 0) / perfSamples.length;
    
    // Get recent blockhash and fee calculator
    const { feeCalculator } = await connection.getRecentBlockhash();
    const baseFee = feeCalculator.lamportsPerSignature / LAMPORTS_PER_SOL;
    
    // Get recent block production info
    const blockProduction = await connection.getBlockProduction();
    const blockProductionSlots = blockProduction.value.byIdentity;
    
    // Calculate network load (simplified)
    const totalSlots = Object.values(blockProductionSlots).reduce(
      (sum, { total }) => sum + total, 0
    );
    const networkLoad = Math.min(tps / 50000, 1); // Normalize TPS to 0-1 range
    
    // Store network stats
    const stats = new NetworkStats({
      averageFee: baseFee,
      medianFee: baseFee, // Simplified, would need more data for true median
      minFee: baseFee * 0.8,
      maxFee: baseFee * 1.5,
      transactionCount: perfSamples.reduce((sum, sample) => sum + sample.numTransactions, 0),
      blockHeight: await connection.getBlockHeight(),
      tps,
      networkLoad,
      predictedFeeIncrease: await predictFeeChange(networkLoad, baseFee),
      recommendedFee: calculateRecommendedFee(baseFee, networkLoad),
      recommendedPriorityFee: calculateRecommendedFee(baseFee, networkLoad, true)
    });
    
    await stats.save();
    logger.info('Network statistics updated');
    
    return stats;
  } catch (error) {
    logger.error(`Error getting network statistics: ${error.message}`);
    throw new Error('Failed to get network statistics');
  }
};

/**
 * Calculate recommended transaction fee
 * @param {number} baseFee - Base fee from network
 * @param {number} networkLoad - Network load (0-1)
 * @param {boolean} priority - Whether this is for priority transactions
 * @returns {number} - Recommended fee
 */
const calculateRecommendedFee = (baseFee, networkLoad, priority = false) => {
  // Base multiplier based on network load
  const loadMultiplier = 1 + (networkLoad * 2);
  
  // Priority multiplier if needed
  const priorityMultiplier = priority ? 1.5 : 1;
  
  // Calculate recommended fee
  return baseFee * loadMultiplier * priorityMultiplier;
};

/**
 * Predict fee change using AI
 * @param {number} networkLoad - Current network load
 * @param {number} currentFee - Current base fee
 * @returns {Promise<number>} - Predicted percentage change
 */
const predictFeeChange = async (networkLoad, currentFee) => {
  try {
    // Get historical fee data
    const historicalStats = await NetworkStats.find()
      .sort({ timestamp: -1 })
      .limit(24);
    
    if (historicalStats.length < 5) {
      // Not enough data for prediction
      return networkLoad > 0.7 ? 10 : 0; // Simple heuristic
    }
    
    // Prepare data for AI analysis
    const historicalData = historicalStats.map(stat => ({
      timestamp: stat.timestamp,
      averageFee: stat.averageFee,
      networkLoad: stat.networkLoad,
      tps: stat.tps
    }));
    
    // Call OpenAI API for prediction
    const prompt = `
      Analyze this Solana network data and predict the percentage change in transaction fees over the next hour:
      
      Current Network State:
      - Network Load: ${networkLoad} (0-1 scale)
      - Current Base Fee: ${currentFee} SOL
      - Current TPS: ${historicalStats[0]?.tps || 'Unknown'}
      
      Historical Data (last ${historicalStats.length} hours):
      ${historicalData.map(data => 
        `- Time: ${data.timestamp}, Fee: ${data.averageFee}, Load: ${data.networkLoad}, TPS: ${data.tps}`
      ).join('\n')}
      
      Based on this data, predict the percentage change in transaction fees over the next hour.
      Return only a number representing the percentage change (positive or negative).
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an AI specializing in blockchain network analysis and fee prediction.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 50
    });
    
    // Parse response
    const predictionText = response.choices[0].message.content.trim();
    const prediction = parseFloat(predictionText.replace('%', ''));
    
    return isNaN(prediction) ? 0 : prediction;
  } catch (error) {
    logger.error(`Error predicting fee change: ${error.message}`);
    return 0; // Default to no change on error
  }
};

/**
 * Get fee recommendations for different transaction priorities
 * @returns {Promise<Object>} - Fee recommendations
 */
export const getFeeRecommendations = async () => {
  try {
    // Get latest network stats
    const latestStats = await NetworkStats.getLatest();
    
    if (!latestStats) {
      // If no stats available, get current network stats
      await getNetworkStatistics();
      return getFeeRecommendations(); // Retry
    }
    
    // Calculate recommendations for different priorities
    return {
      standard: latestStats.recommendedFee,
      fast: latestStats.recommendedFee * 1.2,
      priority: latestStats.recommendedPriorityFee,
      estimated_savings: calculateSavings(latestStats)
    };
  } catch (error) {
    logger.error(`Error getting fee recommendations: ${error.message}`);
    
    // Return default values on error
    return {
      standard: 0.000005,
      fast: 0.00001,
      priority: 0.00002,
      estimated_savings: 0
    };
  }
};

/**
 * Calculate estimated savings from using recommended fees
 * @param {Object} stats - Network statistics
 * @returns {number} - Estimated percentage savings
 */
const calculateSavings = (stats) => {
  // Calculate average overpayment based on max fee vs recommended fee
  const potentialOverpayment = (stats.maxFee - stats.recommendedFee) / stats.maxFee;
  
  // Convert to percentage
  return Math.round(potentialOverpayment * 100);
};

