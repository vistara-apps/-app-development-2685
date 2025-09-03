import React, { useState } from 'react';
import { Copy, Eye, EyeOff, RefreshCw, Key, Globe, Shield } from 'lucide-react';

const ApiSettings = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  
  const apiKey = 'spai_sk_1234567890abcdef1234567890abcdef';
  
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
      path: '/api/v1/payments',
      description: 'Create a new payment transaction'
    },
    {
      method: 'GET',
      path: '/api/v1/payments/{id}',
      description: 'Get payment status and details'
    },
    {
      method: 'POST',
      path: '/api/v1/payouts/batch',
      description: 'Create automated payout batch'
    },
    {
      method: 'GET',
      path: '/api/v1/fraud/analyze',
      description: 'Get AI fraud analysis for transaction'
    }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">API Settings</h1>
        <p className="text-white/70">Manage your API keys and integration settings</p>
      </div>

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
                  value={apiKey}
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
                    onClick={() => copyToClipboard(apiKey)}
                    className="p-1 text-white/50 hover:text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-3 rounded-lg hover:bg-red-500/30 transition-colors flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Regenerate</span>
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
              
              {selectedPlan === plan.id && (
                <div className="mt-4 text-center">
                  <span className="text-blue-400 text-sm font-medium">Current Plan</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
            Upgrade Plan
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
          <button className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>View Full Documentation</span>
          </button>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Usage This Month</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">847</div>
            <div className="text-white/70 text-sm">API Calls</div>
            <div className="text-white/50 text-xs">of 1,000 limit</div>
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
      </div>
    </div>
  );
};

export default ApiSettings;