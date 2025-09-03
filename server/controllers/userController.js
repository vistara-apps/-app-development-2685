import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} - JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return next(new ApiError('User already exists', 400));
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password
    });
    
    // Generate API key
    const apiKey = user.generateApiKey();
    await user.save();
    
    // Send response
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        apiKey,
        subscriptionTier: user.subscriptionTier,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return next(new ApiError('Invalid credentials', 401));
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return next(new ApiError('Invalid credentials', 401));
    }
    
    // Send response
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        apiKey: user.apiKey,
        subscriptionTier: user.subscriptionTier,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    logger.error(`Error logging in user: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return next(new ApiError('User not found', 404));
    }
    
    // Get transaction count
    const transactionCount = await Transaction.countDocuments({ user: user._id });
    
    // Send response
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        apiKey: user.apiKey,
        subscriptionTier: user.subscriptionTier,
        isSubscriptionActive: user.isSubscriptionActive,
        transactionCount,
        transactionLimit: user.transactionLimit,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error(`Error getting user profile: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return next(new ApiError('User not found', 404));
    }
    
    // Update fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    // Save user
    const updatedUser = await user.save();
    
    // Send response
    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        apiKey: updatedUser.apiKey,
        subscriptionTier: updatedUser.subscriptionTier,
        token: generateToken(updatedUser._id)
      }
    });
  } catch (error) {
    logger.error(`Error updating user profile: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Generate new API key
 * @route   POST /api/users/apikey
 * @access  Private
 */
export const generateApiKey = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return next(new ApiError('User not found', 404));
    }
    
    // Generate new API key
    const apiKey = user.generateApiKey();
    await user.save();
    
    // Send response
    res.status(200).json({
      success: true,
      data: {
        apiKey
      }
    });
  } catch (error) {
    logger.error(`Error generating API key: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update subscription tier
 * @route   POST /api/users/subscription
 * @access  Private
 */
export const updateSubscription = async (req, res, next) => {
  try {
    const { tier } = req.body;
    
    // Validate tier
    if (!['free', 'basic', 'pro'].includes(tier)) {
      return next(new ApiError('Invalid subscription tier', 400));
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return next(new ApiError('User not found', 404));
    }
    
    // Update subscription
    user.updateSubscription(tier);
    await user.save();
    
    // Send response
    res.status(200).json({
      success: true,
      data: {
        subscriptionTier: user.subscriptionTier,
        transactionLimit: user.transactionLimit,
        isSubscriptionActive: user.isSubscriptionActive,
        subscriptionExpiresAt: user.subscriptionExpiresAt
      }
    });
  } catch (error) {
    logger.error(`Error updating subscription: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get API usage statistics
 * @route   GET /api/users/usage
 * @access  Private (API Key)
 */
export const getApiUsage = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Get transaction count
    const transactionCount = await Transaction.countDocuments({ user: user._id });
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Calculate usage percentage
    const usagePercentage = (transactionCount / user.transactionLimit) * 100;
    
    // Send response
    res.status(200).json({
      success: true,
      data: {
        transactionCount,
        transactionLimit: user.transactionLimit,
        usagePercentage,
        subscriptionTier: user.subscriptionTier,
        isSubscriptionActive: user.isSubscriptionActive,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        recentTransactions
      }
    });
  } catch (error) {
    logger.error(`Error getting API usage: ${error.message}`);
    next(error);
  }
};

