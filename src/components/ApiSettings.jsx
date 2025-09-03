import React, { useState, useEffect } from 'react';
import { Copy, Eye, EyeOff, RefreshCw, Key, Globe, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { authApi } from '../services/api';

const ApiSettings = () => {
  const { user, generateApiKey, updateSubscription } = useAuth();
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [notification, setNotification] = useState(null);
  
  const generateApiKeyApi = useApi(authApi.generateApiKey);
  const updateSubscriptionApi = useApi(authApi.updateSubscription);
  const getUsageApi = useApi(authApi.getUsage);
  
  // Set selected plan based on user data
  useEffect(() => {
    if (user?.subscriptionTier) {
      setSelectedPlan(user.subscriptionTier);
    }
  }, [user]);
  
  // Get usage statistics
  useEffect(() => {
    getUsageApi.execute();
  }, []);
  
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '/month',
      transactions: '100',
      features: ['Basic API access', 'Standard support', 'Rate limit: 10/min']
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$29',
      period: '/month',
      transactions: '1,000',
      features: ['Full API access', 'Basic fraud detection', 'Priority support', 'Rate limit: 100/min']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$79',
      period: '/month',
      transactions: '5,000',
      features: ['Advanced AI features', 'Smart fee optimization', '24/7 support', 'Custom rate limits']
    }
  ];

  const endpoints = [
    {
      method: 'POST',
      path: '/api/payments',
      description: 'Create a new payment transaction'
    },
    {
      method: 'GET',
      path: '/api/payments/{id}',
      description: 'Get payment status and details'
    },
    {
      method: 'POST',
      path: '/api/payouts/batch',
      description: 'Create automated payout batch'
    },
    {
      method: 'POST',
      path: '/api/payments/analyze',
      description: 'Get AI fraud analysis for transaction'
    }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('API key copied to clipboard', 'success');
  };
  
  const handleRegenerateApiKey = async () => {
    try {
      await generateApiKeyApi.execute();
      showNotification('API key regenerated successfully', 'success');
    } catch (error) {
      showNotification('Failed to regenerate API key', 'error');
    }
  };
  
  const handleUpgradePlan = async () => {
    try {
      if (selectedPlan === user?.subscriptionTier) {
        showNotification('You are already on this plan', 'info');
        return;
      }
      
      await updateSubscriptionApi.execute(selectedPlan);
      showNotification(`Subscription updated to ${selectedPlan}`, 'success');
    } catch (error) {
      showNotification('Failed to update subscription', 'error');
    }
  };
  
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">API Settings</h1>
        <p className="text-white/70">Manage your API keys and integration settings</p>
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${
          notification.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          notification.type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          <AlertCircle className="w-5 h-5" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* API Key Management */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-6">API Key</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Your API Key</label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={user?.apiKey || ''}
                  readOnly
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-mono text-sm pr-20"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-1 text-white/50 hover:text-white transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(user?.apiKey)}
                    className="p-1 text-white/50 hover:text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button 
                onClick={handleRegenerateApiKey}
                disabled={generateApiKeyApi.loading}
                className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-3 rounded-lg hover:bg-red-500/30 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {generateApiKeyApi.loading ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </span>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Regenerate</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-white/50 text-sm mt-2">Keep your API key secure. Never share it publicly or expose it in client-side code.</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <h4 className="text-blue-400 font-medium">Security Best Practices</h4>
            </div>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Store API keys in environment variables</li>
              <li>• Use HTTPS for all API requests</li>
              <li>• Implement proper rate limiting in your application</li>
              <li>• Monitor API usage regularly</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Subscription Plan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/20 hover:border-white/30'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className="text-center mb-4">
                <h4 className="text-xl font-semibold text-white mb-2">{plan.name}</h4>
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/70 ml-1">{plan.period}</span>
                </div>
                <p className="text-white/70 text-sm mt-2">{plan.transactions} transactions</p>
              </div>
              
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span className="text-white/70 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {user?.subscriptionTier === plan.id && (
                <div className="mt-4 text-center">
                  <span className="text-blue-400 text-sm font-medium">Current Plan</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button 
            onClick={handleUpgradePlan}
            disabled={updateSubscriptionApi.loading || selectedPlan === user?.subscriptionTier}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateSubscriptionApi.loading ? 'Processing...' : 'Upgrade Plan'}
          </button>
        </div>
      </div>

      {/* API Documentation */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-6">API Endpoints</h3>
        
        <div className="space-y-4">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="border border-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {endpoint.method}
                </span>
                <code className="text-white font-mono">{endpoint.path}</code>
              </div>
              <p className="text-white/70 text-sm">{endpoint.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => window.open('/api-docs', '_blank')}
            className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
          >
            <Globe className="w-4 h-4" />
            <span>View Full Documentation</span>
          </button>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Usage This Month</h3>
        
        {getUsageApi.loading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {getUsageApi.data?.transactionCount || 0}
              </div>
              <div className="text-white/70 text-sm">API Calls</div>
              <div className="text-white/50 text-xs">
                of {getUsageApi.data?.transactionLimit || user?.transactionLimit || 100} limit
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-white/70 text-sm">Uptime</div>
              <div className="text-white/50 text-xs">last 30 days</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">0.12s</div>
              <div className="text-white/70 text-sm">Avg Response</div>
              <div className="text-white/50 text-xs">response time</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiSettings;
