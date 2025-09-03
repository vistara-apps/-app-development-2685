import React from 'react';
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const FraudDetection = () => {
  const riskMetrics = [
    {
      title: 'Risk Score',
      value: '2.3%',
      status: 'low',
      icon: Shield,
      description: 'Overall fraud risk across all transactions'
    },
    {
      title: 'Flagged Today',
      value: '3',
      status: 'medium',
      icon: AlertTriangle,
      description: 'Transactions flagged for review'
    },
    {
      title: 'False Positives',
      value: '0.8%',
      status: 'low',
      icon: CheckCircle,
      description: 'Accuracy of fraud detection'
    },
    {
      title: 'Prevention Rate',
      value: '99.2%',
      status: 'high',
      icon: TrendingUp,
      description: 'Successfully prevented fraud attempts'
    }
  ];

  const flaggedTransactions = [
    {
      id: 'tx_flag_001',
      timestamp: '2024-01-15 15:42:33',
      amount: '15.8 SOL',
      riskScore: 0.85,
      reason: 'Unusual transaction pattern',
      status: 'under_review'
    },
    {
      id: 'tx_flag_002',
      timestamp: '2024-01-15 14:18:12',
      amount: '8.2 SOL',
      riskScore: 0.72,
      reason: 'High velocity sending',
      status: 'approved'
    },
    {
      id: 'tx_flag_003',
      timestamp: '2024-01-15 13:55:41',
      amount: '23.5 SOL',
      riskScore: 0.68,
      reason: 'New recipient address',
      status: 'blocked'
    }
  ];

  const aiInsights = [
    {
      type: 'pattern',
      title: 'Suspicious Pattern Detected',
      description: 'Multiple small transactions from new addresses detected. Possible dust attack pattern.',
      confidence: 92,
      action: 'Monitor closely'
    },
    {
      type: 'velocity',
      title: 'High Velocity Alert',
      description: 'Address 7xKX...9mPq showing 300% increase in transaction frequency.',
      confidence: 78,
      action: 'Flag for review'
    },
    {
      type: 'network',
      title: 'Network Analysis',
      description: 'Connected addresses showing coordinated behavior patterns.',
      confidence: 85,
      action: 'Deep investigation'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">AI Fraud Detection</h1>
        <p className="text-white/70">Real-time AI-powered fraud detection and prevention</p>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {riskMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const statusColor = 
            metric.status === 'low' ? 'text-green-400' :
            metric.status === 'medium' ? 'text-yellow-400' :
            metric.status === 'high' ? 'text-red-400' : 'text-blue-400';
          
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  metric.status === 'low' ? 'bg-green-500/20' :
                  metric.status === 'medium' ? 'bg-yellow-500/20' :
                  metric.status === 'high' ? 'bg-red-500/20' : 'bg-blue-500/20'
                }`}>
                  <Icon className={`w-5 h-5 ${statusColor}`} />
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  metric.status === 'low' ? 'bg-green-400' :
                  metric.status === 'medium' ? 'bg-yellow-400' :
                  metric.status === 'high' ? 'bg-red-400' : 'bg-blue-400'
                }`}></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
              <p className="text-white font-medium mb-2">{metric.title}</p>
              <p className="text-white/50 text-sm">{metric.description}</p>
            </div>
          );
        })}
      </div>

      {/* AI Insights */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-6">AI Security Insights</h3>
        <div className="space-y-4">
          {aiInsights.map((insight, index) => (
            <div key={index} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    insight.type === 'pattern' ? 'bg-yellow-400' :
                    insight.type === 'velocity' ? 'bg-red-400' : 'bg-blue-400'
                  }`}></div>
                  <h4 className="text-white font-semibold">{insight.title}</h4>
                </div>
                <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded">
                  {insight.confidence}% confidence
                </span>
              </div>
              <p className="text-white/70 mb-3">{insight.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-400 font-medium">Action: {insight.action}</span>
                <button className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded hover:bg-blue-500/30 transition-colors">
                  Investigate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flagged Transactions */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Flagged Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/70 font-medium py-3">Transaction ID</th>
                <th className="text-left text-white/70 font-medium py-3">Timestamp</th>
                <th className="text-left text-white/70 font-medium py-3">Amount</th>
                <th className="text-left text-white/70 font-medium py-3">Risk Score</th>
                <th className="text-left text-white/70 font-medium py-3">Reason</th>
                <th className="text-left text-white/70 font-medium py-3">Status</th>
                <th className="text-left text-white/70 font-medium py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flaggedTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4">
                    <span className="text-blue-400 font-mono text-sm">{tx.id}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-white/70 text-sm">{tx.timestamp}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-white font-semibold">{tx.amount}</span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        tx.riskScore > 0.8 ? 'bg-red-400' :
                        tx.riskScore > 0.6 ? 'bg-yellow-400' : 'bg-green-400'
                      }`}></div>
                      <span className="text-white/70">{(tx.riskScore * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-white/70 text-sm">{tx.reason}</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tx.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      tx.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {tx.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex space-x-2">
                      <button className="text-green-400 hover:text-green-300 text-sm">Approve</button>
                      <button className="text-red-400 hover:text-red-300 text-sm">Block</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FraudDetection;