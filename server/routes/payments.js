import express from 'express';
import { apiKeyAuth } from '../middleware/auth.js';
import { 
  createPayment,
  getPaymentById,
  getPayments,
  analyzeTransaction
} from '../controllers/paymentController.js';

const router = express.Router();

/**
 * @route   POST /api/payments
 * @desc    Create a new payment
 * @access  Private (API Key)
 */
router.post('/', apiKeyAuth, createPayment);

/**
 * @route   GET /api/payments
 * @desc    Get all payments for a user
 * @access  Private (API Key)
 */
router.get('/', apiKeyAuth, getPayments);

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Private (API Key)
 */
router.get('/:id', apiKeyAuth, getPaymentById);

/**
 * @route   POST /api/payments/analyze
 * @desc    Analyze a transaction for fraud
 * @access  Private (API Key)
 */
router.post('/analyze', apiKeyAuth, analyzeTransaction);

export default router;

