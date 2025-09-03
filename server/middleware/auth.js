import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

/**
 * Protect routes - JWT authentication
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return next(new ApiError('Not authorized to access this route', 401));
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return next(new ApiError('User not found', 404));
      }
      
      next();
    } catch (error) {
      logger.error(`JWT verification error: ${error.message}`);
      return next(new ApiError('Not authorized to access this route', 401));
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    next(error);
  }
};

/**
 * API key authentication
 */
export const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    // Check if API key exists
    if (!apiKey) {
      return next(new ApiError('API key is required', 401));
    }
    
    // Find user by API key
    const user = await User.findOne({ apiKey });
    
    if (!user) {
      return next(new ApiError('Invalid API key', 401));
    }
    
    // Check if subscription is active
    if (!user.isSubscriptionActive) {
      return next(new ApiError('Subscription is inactive', 403));
    }
    
    // Check if subscription has expired
    if (user.subscriptionExpiresAt < new Date()) {
      user.isSubscriptionActive = false;
      await user.save();
      return next(new ApiError('Subscription has expired', 403));
    }
    
    // Set user in request
    req.user = user;
    
    next();
  } catch (error) {
    logger.error(`API key auth error: ${error.message}`);
    next(error);
  }
};

