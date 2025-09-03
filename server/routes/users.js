import express from 'express';
import { 
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  generateApiKey,
  updateSubscription,
  getApiUsage
} from '../controllers/userController.js';
import { protect, apiKeyAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private (JWT)
 */
router.get('/profile', protect, getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private (JWT)
 */
router.put('/profile', protect, updateUserProfile);

/**
 * @route   POST /api/users/apikey
 * @desc    Generate a new API key
 * @access  Private (JWT)
 */
router.post('/apikey', protect, generateApiKey);

/**
 * @route   POST /api/users/subscription
 * @desc    Update subscription tier
 * @access  Private (JWT)
 */
router.post('/subscription', protect, updateSubscription);

/**
 * @route   GET /api/users/usage
 * @desc    Get API usage statistics
 * @access  Private (API Key)
 */
router.get('/usage', apiKeyAuth, getApiUsage);

export default router;

