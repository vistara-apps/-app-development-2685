import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Solana PayAI API',
      version: '1.0.0',
      description: 'API documentation for Solana PayAI - AI-powered payment processing on Solana blockchain',
      contact: {
        name: 'API Support',
        email: 'support@solanapayai.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.solanapayai.com/api' 
          : 'http://localhost:5000/api',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js', './models/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

/**
 * Setup Swagger documentation
 * @param {Express} app - Express app
 */
export const setupSwagger = (app) => {
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  
  // Serve swagger.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
  });
};

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication and API key management
 *   - name: Payments
 *     description: Payment processing and transaction management
 *   - name: Payouts
 *     description: Automated batch payouts to multiple recipients
 *   - name: Fraud Detection
 *     description: AI-powered fraud detection and analysis
 *   - name: Network
 *     description: Solana network statistics and fee management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           description: User's email
 *         apiKey:
 *           type: string
 *           description: API key for authentication
 *         subscriptionTier:
 *           type: string
 *           enum: [free, basic, pro]
 *           description: Subscription tier
 *         isSubscriptionActive:
 *           type: boolean
 *           description: Whether subscription is active
 *         transactionCount:
 *           type: number
 *           description: Number of transactions processed
 *         transactionLimit:
 *           type: number
 *           description: Maximum transactions allowed
 *       example:
 *         id: 60d0fe4f5311236168a109ca
 *         name: John Doe
 *         email: john@example.com
 *         apiKey: spai_1234567890abcdef1234567890abcdef
 *         subscriptionTier: basic
 *         isSubscriptionActive: true
 *         transactionCount: 250
 *         transactionLimit: 1000
 *     
 *     Transaction:
 *       type: object
 *       required:
 *         - senderAddress
 *         - recipientAddress
 *         - amount
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID
 *         transactionId:
 *           type: string
 *           description: Unique transaction identifier
 *         senderAddress:
 *           type: string
 *           description: Sender's Solana address
 *         recipientAddress:
 *           type: string
 *           description: Recipient's Solana address
 *         amount:
 *           type: number
 *           description: Transaction amount
 *         token:
 *           type: string
 *           description: Token type (SOL or SPL token)
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           description: Transaction status
 *         signature:
 *           type: string
 *           description: Solana transaction signature
 *         estimatedFee:
 *           type: number
 *           description: Estimated transaction fee
 *         actualFee:
 *           type: number
 *           description: Actual transaction fee
 *         fraudScore:
 *           type: number
 *           description: AI-generated fraud risk score (0-1)
 *       example:
 *         id: 60d0fe4f5311236168a109cb
 *         transactionId: tx_001
 *         senderAddress: 7xKX...9mPq
 *         recipientAddress: 4nQv...2kLs
 *         amount: 2.5
 *         token: SOL
 *         status: completed
 *         signature: 5Uqu...7mFo
 *         estimatedFee: 0.00025
 *         actualFee: 0.00025
 *         fraudScore: 0.05
 *     
 *     PayoutBatch:
 *       type: object
 *       required:
 *         - name
 *         - totalAmount
 *         - recipientCount
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID
 *         batchId:
 *           type: string
 *           description: Unique batch identifier
 *         name:
 *           type: string
 *           description: Batch name
 *         status:
 *           type: string
 *           enum: [created, scheduled, processing, completed, failed, cancelled]
 *           description: Batch status
 *         totalAmount:
 *           type: number
 *           description: Total amount to be paid
 *         token:
 *           type: string
 *           description: Token type (SOL or SPL token)
 *         recipientCount:
 *           type: number
 *           description: Number of recipients
 *         scheduledFor:
 *           type: string
 *           format: date-time
 *           description: Scheduled execution date
 *       example:
 *         id: 60d0fe4f5311236168a109cc
 *         batchId: batch_001
 *         name: Weekly Payroll
 *         status: scheduled
 *         totalAmount: 25.5
 *         token: SOL
 *         recipientCount: 12
 *         scheduledFor: 2024-01-20T10:00:00Z
 *     
 *     Payout:
 *       type: object
 *       required:
 *         - recipientAddress
 *         - amount
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID
 *         payoutId:
 *           type: string
 *           description: Unique payout identifier
 *         recipientAddress:
 *           type: string
 *           description: Recipient's Solana address
 *         amount:
 *           type: number
 *           description: Payout amount
 *         token:
 *           type: string
 *           description: Token type (SOL or SPL token)
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           description: Payout status
 *       example:
 *         id: 60d0fe4f5311236168a109cd
 *         payoutId: pay_001
 *         recipientAddress: 4nQv...2kLs
 *         amount: 2.5
 *         token: SOL
 *         status: pending
 *     
 *     FraudAlert:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID
 *         alertId:
 *           type: string
 *           description: Unique alert identifier
 *         type:
 *           type: string
 *           enum: [pattern, velocity, amount, address, network, other]
 *           description: Alert type
 *         severity:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Alert severity
 *         score:
 *           type: number
 *           description: Risk score (0-1)
 *         description:
 *           type: string
 *           description: Alert description
 *         status:
 *           type: string
 *           enum: [open, under_review, resolved, false_positive, confirmed_fraud]
 *           description: Alert status
 *       example:
 *         id: 60d0fe4f5311236168a109ce
 *         alertId: alert_001
 *         type: pattern
 *         severity: medium
 *         score: 0.75
 *         description: Unusual transaction pattern detected
 *         status: open
 *     
 *     NetworkStats:
 *       type: object
 *       properties:
 *         averageFee:
 *           type: number
 *           description: Average transaction fee
 *         medianFee:
 *           type: number
 *           description: Median transaction fee
 *         tps:
 *           type: number
 *           description: Transactions per second
 *         networkLoad:
 *           type: number
 *           description: Network load (0-1)
 *         recommendedFee:
 *           type: number
 *           description: Recommended fee for standard transactions
 *       example:
 *         averageFee: 0.000025
 *         medianFee: 0.000020
 *         tps: 1500
 *         networkLoad: 0.65
 *         recommendedFee: 0.000022
 */

