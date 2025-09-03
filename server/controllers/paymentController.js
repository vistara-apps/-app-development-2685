import Transaction from '../models/Transaction.js';
import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { isValidSolanaAddress, sendSol, estimateTransactionFee } from '../services/solana.js';
import { analyzeTransaction as analyzeFraud } from '../services/fraudDetection.js';
import crypto from 'crypto';

/**
 * @desc    Create a new payment
 * @route   POST /api/payments
 * @access  Private (API Key)
 */
export const createPayment = async (req, res, next) => {
  try {
    const { senderAddress, recipientAddress, amount, token = 'SOL', metadata } = req.body;
    
    // Validate addresses
    if (!isValidSolanaAddress(senderAddress)) {
      return next(new ApiError('Invalid sender address', 400));
    }
    
    if (!isValidSolanaAddress(recipientAddress)) {
      return next(new ApiError('Invalid recipient address', 400));
    }
    
    // Validate amount
    if (!amount || amount <= 0) {
      return next(new ApiError('Amount must be greater than 0', 400));
    }
    
    // Check user transaction limit
    const transactionCount = await Transaction.countDocuments({ user: req.user._id });
    
    if (transactionCount >= req.user.transactionLimit) {
      return next(new ApiError('Transaction limit reached for your subscription tier', 403));
    }
    
    // Estimate fee
    const estimatedFee = await estimateTransactionFee();
    
    // Create transaction
    const transaction = new Transaction({
      user: req.user._id,
      transactionId: `tx_${crypto.randomBytes(8).toString('hex')}`,
      senderAddress,
      recipientAddress,
      amount,
      token,
      status: 'pending',
      estimatedFee,
      metadata
    });
    
    // Analyze for fraud
    const fraudAnalysis = await analyzeFraud(transaction, req.user);
    
    // Update transaction with fraud score
    transaction.fraudScore = fraudAnalysis.score;
    
    // If high fraud risk, mark as fraudulent
    if (fraudAnalysis.score > 0.8) {
      transaction.isFraudulent = true;
      transaction.fraudReason = fraudAnalysis.reasons[0] || 'High fraud risk detected';
      transaction.status = 'failed';
      
      await transaction.save();
      
      return next(new ApiError('Transaction rejected due to high fraud risk', 403));
    }
    
    // Process transaction
    try {
      // Update status
      transaction.status = 'processing';
      await transaction.save();
      
      // Send payment
      const signature = await sendSol(recipientAddress, amount);
      
      // Update transaction with success
      transaction.status = 'completed';
      transaction.signature = signature;
      transaction.actualFee = estimatedFee; // In a real implementation, get actual fee from transaction
      await transaction.save();
      
      // Increment user transaction count
      req.user.transactionCount += 1;
      await req.user.save();
      
      // Send response
      res.status(201).json({
        success: true,
        data: {
          transactionId: transaction.transactionId,
          signature,
          status: 'completed',
          fraudScore: transaction.fraudScore,
          fee: transaction.actualFee
        }
      });
    } catch (error) {
      // Update transaction with failure
      transaction.status = 'failed';
      await transaction.save();
      
      logger.error(`Error processing payment: ${error.message}`);
      return next(new ApiError(`Payment processing failed: ${error.message}`, 500));
    }
  } catch (error) {
    logger.error(`Error creating payment: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all payments for a user
 * @route   GET /api/payments
 * @access  Private (API Key)
 */
export const getPayments = async (req, res, next) => {
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
    
    if (req.query.minAmount) {
      query.amount = { $gte: parseFloat(req.query.minAmount) };
    }
    
    if (req.query.maxAmount) {
      query.amount = { ...query.amount, $lte: parseFloat(req.query.maxAmount) };
    }
    
    // Get total count
    const total = await Transaction.countDocuments(query);
    
    // Get transactions
    const transactions = await Transaction.find(query)
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
      data: transactions
    });
  } catch (error) {
    logger.error(`Error getting payments: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get payment by ID
 * @route   GET /api/payments/:id
 * @access  Private (API Key)
 */
export const getPaymentById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      user: req.user._id,
      transactionId: req.params.id
    });
    
    if (!transaction) {
      return next(new ApiError('Transaction not found', 404));
    }
    
    // Send response
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    logger.error(`Error getting payment: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Analyze a transaction for fraud
 * @route   POST /api/payments/analyze
 * @access  Private (API Key)
 */
export const analyzeTransaction = async (req, res, next) => {
  try {
    const { senderAddress, recipientAddress, amount, token = 'SOL' } = req.body;
    
    // Validate addresses
    if (!isValidSolanaAddress(senderAddress)) {
      return next(new ApiError('Invalid sender address', 400));
    }
    
    if (!isValidSolanaAddress(recipientAddress)) {
      return next(new ApiError('Invalid recipient address', 400));
    }
    
    // Validate amount
    if (!amount || amount <= 0) {
      return next(new ApiError('Amount must be greater than 0', 400));
    }
    
    // Create temporary transaction object for analysis
    const transaction = {
      user: req.user._id,
      senderAddress,
      recipientAddress,
      amount,
      token
    };
    
    // Analyze for fraud
    const fraudAnalysis = await analyzeFraud(transaction, req.user);
    
    // Send response
    res.status(200).json({
      success: true,
      data: {
        fraudScore: fraudAnalysis.score,
        risk: fraudAnalysis.risk,
        reasons: fraudAnalysis.reasons,
        recommendation: fraudAnalysis.recommendation
      }
    });
  } catch (error) {
    logger.error(`Error analyzing transaction: ${error.message}`);
    next(error);
  }
};

