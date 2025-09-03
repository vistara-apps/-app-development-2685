/**
 * API client for Solana PayAI backend
 */

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Default headers
const defaultHeaders = {
  'Content-Type': 'application/json',
};

/**
 * Make API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - API response
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    // Get API key from local storage
    const apiKey = localStorage.getItem('apiKey');
    
    // Get token from local storage
    const token = localStorage.getItem('token');
    
    // Prepare headers
    const headers = {
      ...defaultHeaders,
      ...options.headers,
    };
    
    // Add API key if available
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }
    
    // Add token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Parse response
    const data = await response.json();
    
    // Check for errors
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registration response
   */
  register: (userData) => {
    return apiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  /**
   * Login user
   * @param {Object} credentials - User login credentials
   * @returns {Promise<Object>} - Login response
   */
  login: (credentials) => {
    return apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  /**
   * Get user profile
   * @returns {Promise<Object>} - User profile
   */
  getProfile: () => {
    return apiRequest('/users/profile');
  },
  
  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} - Updated profile
   */
  updateProfile: (profileData) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
  
  /**
   * Generate new API key
   * @returns {Promise<Object>} - New API key
   */
  generateApiKey: () => {
    return apiRequest('/users/apikey', {
      method: 'POST',
    });
  },
  
  /**
   * Update subscription tier
   * @param {string} tier - Subscription tier
   * @returns {Promise<Object>} - Updated subscription
   */
  updateSubscription: (tier) => {
    return apiRequest('/users/subscription', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    });
  },
  
  /**
   * Get API usage statistics
   * @returns {Promise<Object>} - API usage statistics
   */
  getUsage: () => {
    return apiRequest('/users/usage');
  },
};

/**
 * Payments API
 */
export const paymentsApi = {
  /**
   * Create a new payment
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} - Payment response
   */
  createPayment: (paymentData) => {
    return apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
  
  /**
   * Get all payments
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} - Payments list
   */
  getPayments: (filters = {}) => {
    // Build query string
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    return apiRequest(`/payments?${queryParams.toString()}`);
  },
  
  /**
   * Get payment by ID
   * @param {string} id - Payment ID
   * @returns {Promise<Object>} - Payment details
   */
  getPaymentById: (id) => {
    return apiRequest(`/payments/${id}`);
  },
  
  /**
   * Analyze transaction for fraud
   * @param {Object} transactionData - Transaction data
   * @returns {Promise<Object>} - Fraud analysis
   */
  analyzeTransaction: (transactionData) => {
    return apiRequest('/payments/analyze', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },
};

/**
 * Payouts API
 */
export const payoutsApi = {
  /**
   * Create a new payout batch
   * @param {Object} batchData - Batch data
   * @returns {Promise<Object>} - Batch response
   */
  createBatch: (batchData) => {
    return apiRequest('/payouts/batch', {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  },
  
  /**
   * Get all payout batches
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} - Batches list
   */
  getBatches: (filters = {}) => {
    // Build query string
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    return apiRequest(`/payouts/batch?${queryParams.toString()}`);
  },
  
  /**
   * Get payout batch by ID
   * @param {string} id - Batch ID
   * @returns {Promise<Object>} - Batch details
   */
  getBatchById: (id) => {
    return apiRequest(`/payouts/batch/${id}`);
  },
  
  /**
   * Update payout batch
   * @param {string} id - Batch ID
   * @param {Object} batchData - Updated batch data
   * @returns {Promise<Object>} - Updated batch
   */
  updateBatch: (id, batchData) => {
    return apiRequest(`/payouts/batch/${id}`, {
      method: 'PUT',
      body: JSON.stringify(batchData),
    });
  },
  
  /**
   * Cancel payout batch
   * @param {string} id - Batch ID
   * @returns {Promise<Object>} - Cancellation response
   */
  cancelBatch: (id) => {
    return apiRequest(`/payouts/batch/${id}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * Schedule payout batch
   * @param {string} id - Batch ID
   * @param {Object} scheduleData - Schedule data
   * @returns {Promise<Object>} - Schedule response
   */
  scheduleBatch: (id, scheduleData) => {
    return apiRequest(`/payouts/batch/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  },
  
  /**
   * Get payouts in a batch
   * @param {string} id - Batch ID
   * @returns {Promise<Object>} - Payouts list
   */
  getPayoutsByBatchId: (id) => {
    return apiRequest(`/payouts/batch/${id}/payouts`);
  },
};

/**
 * Network API
 */
export const networkApi = {
  /**
   * Get network statistics
   * @returns {Promise<Object>} - Network statistics
   */
  getNetworkStats: () => {
    return apiRequest('/network/stats');
  },
  
  /**
   * Get fee recommendations
   * @returns {Promise<Object>} - Fee recommendations
   */
  getFeeRecommendations: () => {
    return apiRequest('/network/fees');
  },
};

