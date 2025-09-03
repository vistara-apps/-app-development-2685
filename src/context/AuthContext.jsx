import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../services/api';

// Create context
const AuthContext = createContext();

/**
 * Auth provider component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load user from local storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if token exists
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Get user profile
        const response = await authApi.getProfile();
        setUser(response.data);
      } catch (error) {
        console.error('Error loading user:', error);
        // Clear local storage on error
        localStorage.removeItem('token');
        localStorage.removeItem('apiKey');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.register(userData);
      
      // Save token and API key
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('apiKey', response.data.apiKey);
      
      // Set user
      setUser(response.data);
      
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Login user
   * @param {Object} credentials - User login credentials
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.login(credentials);
      
      // Save token and API key
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('apiKey', response.data.apiKey);
      
      // Set user
      setUser(response.data);
      
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Logout user
   */
  const logout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('apiKey');
    
    // Clear user
    setUser(null);
  };
  
  /**
   * Generate new API key
   */
  const generateApiKey = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.generateApiKey();
      
      // Save new API key
      localStorage.setItem('apiKey', response.data.apiKey);
      
      // Update user
      setUser((prevUser) => ({
        ...prevUser,
        apiKey: response.data.apiKey,
      }));
      
      return response.data.apiKey;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Update subscription tier
   * @param {string} tier - Subscription tier
   */
  const updateSubscription = async (tier) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.updateSubscription(tier);
      
      // Update user
      setUser((prevUser) => ({
        ...prevUser,
        subscriptionTier: response.data.subscriptionTier,
        transactionLimit: response.data.transactionLimit,
        isSubscriptionActive: response.data.isSubscriptionActive,
        subscriptionExpiresAt: response.data.subscriptionExpiresAt,
      }));
      
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Context value
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    generateApiKey,
    updateSubscription,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;

