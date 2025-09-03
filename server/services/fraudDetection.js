import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import Transaction from '../models/Transaction.js';
import FraudAlert from '../models/FraudAlert.js';
import crypto from 'crypto';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyze transaction for fraud risk
 * @param {Object} transaction - Transaction data
 * @param {Object} user - User data
 * @returns {Promise<Object>} - Fraud analysis result
 */
export const analyzeTransaction = async (transaction, user) => {
  try {
    // Get user's transaction history
    const userTransactions = await Transaction.find({ 
      user: user._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    }).sort({ createdAt: -1 }).limit(100);
    
    // Prepare transaction data for analysis
    const transactionData = {
      senderAddress: transaction.senderAddress,
      recipientAddress: transaction.recipientAddress,
      amount: transaction.amount,
      token: transaction.token,
      timestamp: new Date().toISOString()
    };
    
    // Prepare historical data
    const historicalData = userTransactions.map(tx => ({
      senderAddress: tx.senderAddress,
      recipientAddress: tx.recipientAddress,
      amount: tx.amount,
      token: tx.token,
      timestamp: tx.createdAt.toISOString(),
      status: tx.status
    }));
    
    // Check for basic red flags
    const basicChecks = performBasicFraudChecks(transactionData, historicalData);
    
    // If basic checks find high risk, return immediately
    if (basicChecks.score > 0.8) {
      await createFraudAlert(transaction, user, basicChecks);
      return basicChecks;
    }
    
    // Perform AI analysis for more complex patterns
    const aiAnalysis = await performAIAnalysis(transactionData, historicalData);
    
    // Combine results
    const combinedScore = Math.max(basicChecks.score, aiAnalysis.score);
    const combinedResult = {
      score: combinedScore,
      risk: getRiskLevel(combinedScore),
      reasons: [...basicChecks.reasons, ...aiAnalysis.reasons].filter(Boolean),
      recommendation: combinedScore > 0.6 ? 'review' : 'approve'
    };
    
    // Create fraud alert if risk is medium or higher
    if (combinedScore > 0.4) {
      await createFraudAlert(transaction, user, combinedResult);
    }
    
    return combinedResult;
  } catch (error) {
    logger.error(`Error analyzing transaction for fraud: ${error.message}`);
    // Return a default low-risk result in case of error
    return {
      score: 0.1,
      risk: 'low',
      reasons: ['Error in fraud analysis, defaulting to low risk'],
      recommendation: 'approve'
    };
  }
};

/**
 * Perform basic fraud checks
 * @param {Object} transaction - Current transaction
 * @param {Array} history - Transaction history
 * @returns {Object} - Basic fraud check results
 */
const performBasicFraudChecks = (transaction, history) => {
  const reasons = [];
  let score = 0;
  
  // Check 1: Unusually large amount
  const averageAmount = history.length > 0 
    ? history.reduce((sum, tx) => sum + tx.amount, 0) / history.length 
    : transaction.amount;
  
  if (transaction.amount > averageAmount * 5) {
    reasons.push('Transaction amount is significantly larger than average');
    score += 0.3;
  }
  
  // Check 2: New recipient
  const isNewRecipient = !history.some(tx => 
    tx.recipientAddress === transaction.recipientAddress
  );
  
  if (isNewRecipient && history.length > 10) {
    reasons.push('Recipient address has not been used before');
    score += 0.2;
  }
  
  // Check 3: High velocity (many transactions in short time)
  const lastHourTransactions = history.filter(tx => 
    new Date(tx.timestamp) > new Date(Date.now() - 60 * 60 * 1000)
  );
  
  if (lastHourTransactions.length > 10) {
    reasons.push('High transaction velocity detected');
    score += 0.3;
  }
  
  // Check 4: Round amount (often associated with fraud)
  if (transaction.amount % 1 === 0 && transaction.amount > 10) {
    reasons.push('Suspiciously round transaction amount');
    score += 0.1;
  }
  
  return {
    score,
    risk: getRiskLevel(score),
    reasons: reasons.length > 0 ? reasons : ['No basic risk factors detected'],
    recommendation: score > 0.6 ? 'review' : 'approve'
  };
};

/**
 * Perform AI-based fraud analysis
 * @param {Object} transaction - Current transaction
 * @param {Array} history - Transaction history
 * @returns {Promise<Object>} - AI analysis results
 */
const performAIAnalysis = async (transaction, history) => {
  try {
    // Prepare data for OpenAI
    const prompt = `
      Analyze this Solana blockchain transaction for potential fraud:
      
      Current Transaction:
      - Sender: ${transaction.senderAddress}
      - Recipient: ${transaction.recipientAddress}
      - Amount: ${transaction.amount} ${transaction.token}
      - Timestamp: ${transaction.timestamp}
      
      Transaction History (last ${history.length} transactions):
      ${history.slice(0, 10).map(tx => 
        `- Sender: ${tx.senderAddress}, Recipient: ${tx.recipientAddress}, Amount: ${tx.amount} ${tx.token}, Time: ${tx.timestamp}`
      ).join('\n')}
      
      Analyze this transaction for fraud risk. Consider:
      1. Unusual patterns compared to history
      2. Suspicious timing or amounts
      3. Known fraud patterns on Solana
      4. Network of addresses and relationships
      
      Return a JSON object with:
      1. A fraud risk score between 0 and 1 (0 = safe, 1 = definitely fraud)
      2. A list of reasons for the score
      3. A risk level (low, medium, high, critical)
      4. A recommendation (approve, review, reject)
    `;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a fraud detection AI specializing in cryptocurrency transactions.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });
    
    // Parse response
    const analysisText = response.choices[0].message.content;
    const analysis = JSON.parse(analysisText);
    
    return {
      score: analysis.score || 0,
      risk: analysis.risk_level || 'low',
      reasons: analysis.reasons || [],
      recommendation: analysis.recommendation || 'approve'
    };
  } catch (error) {
    logger.error(`Error in AI fraud analysis: ${error.message}`);
    // Return a default low-risk result in case of error
    return {
      score: 0.1,
      risk: 'low',
      reasons: ['AI analysis unavailable, defaulting to low risk'],
      recommendation: 'approve'
    };
  }
};

/**
 * Create a fraud alert
 * @param {Object} transaction - Transaction data
 * @param {Object} user - User data
 * @param {Object} analysis - Fraud analysis result
 */
const createFraudAlert = async (transaction, user, analysis) => {
  try {
    // Determine alert type and severity
    const alertType = determineAlertType(analysis.reasons);
    const severity = determineSeverity(analysis.score);
    
    // Create alert
    const alert = new FraudAlert({
      user: user._id,
      transaction: transaction._id,
      alertId: `alert_${crypto.randomBytes(8).toString('hex')}`,
      type: alertType,
      severity,
      score: analysis.score,
      description: analysis.reasons[0] || 'Suspicious transaction detected',
      details: {
        reasons: analysis.reasons,
        recommendation: analysis.recommendation,
        transactionData: {
          senderAddress: transaction.senderAddress,
          recipientAddress: transaction.recipientAddress,
          amount: transaction.amount,
          token: transaction.token
        }
      },
      status: 'open'
    });
    
    await alert.save();
    logger.info(`Fraud alert created: ${alert.alertId}`);
    
    return alert;
  } catch (error) {
    logger.error(`Error creating fraud alert: ${error.message}`);
  }
};

/**
 * Determine alert type based on reasons
 * @param {Array} reasons - List of fraud reasons
 * @returns {string} - Alert type
 */
const determineAlertType = (reasons) => {
  const reasonText = reasons.join(' ').toLowerCase();
  
  if (reasonText.includes('pattern') || reasonText.includes('unusual')) {
    return 'pattern';
  } else if (reasonText.includes('velocity') || reasonText.includes('frequency')) {
    return 'velocity';
  } else if (reasonText.includes('amount') || reasonText.includes('large')) {
    return 'amount';
  } else if (reasonText.includes('address') || reasonText.includes('recipient')) {
    return 'address';
  } else if (reasonText.includes('network') || reasonText.includes('cluster')) {
    return 'network';
  } else {
    return 'other';
  }
};

/**
 * Determine severity based on score
 * @param {number} score - Fraud score
 * @returns {string} - Severity level
 */
const determineSeverity = (score) => {
  if (score >= 0.8) {
    return 'critical';
  } else if (score >= 0.6) {
    return 'high';
  } else if (score >= 0.4) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * Get risk level based on score
 * @param {number} score - Fraud score
 * @returns {string} - Risk level
 */
const getRiskLevel = (score) => {
  if (score >= 0.8) {
    return 'critical';
  } else if (score >= 0.6) {
    return 'high';
  } else if (score >= 0.4) {
    return 'medium';
  } else if (score >= 0.2) {
    return 'low';
  } else {
    return 'minimal';
  }
};

