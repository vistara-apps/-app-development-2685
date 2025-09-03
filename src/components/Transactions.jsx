import React, { useState } from 'react';
import { Search, Filter, Download, Plus } from 'lucide-react';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const transactions = [
    {
      id: 'tx_001',
      timestamp: '2024-01-15 14:30:22',
      sender: '7xKX...9mPq',
      recipient: '4nQv...2kLs',
      amount: '2.5 SOL',
      status: 'completed',
      fee: '0.00025 SOL',
      fraudScore: 0.1
    },
    {
      id: 'tx_002', 
      timestamp: '2024-01-15 14:28:15',
      sender: '9pTr...5xVb',
      recipient: '2mKj...8nWp',
      amount: '1.2 SOL',
      status: 'completed',
      fee: '0.00025 SOL',
      fraudScore: 0.05
    },
    {
      id: 'tx_003',
      timestamp: '2024-01-15 14:25:03',
      sender: '5kLm...7pQw',
      recipient: '8xYz...3mNv',
      amount: '0.8 SOL',
      status: 'pending',
      fee: '0.00025 SOL',
      fraudScore: 0.3
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
          <p className="text-white/70">Monitor and manage all your Solana payments</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/70 font-medium py-3">Transaction ID</th>
                <th className="text-left text-white/70 font-medium py-3">Timestamp</th>
                <th className="text-left text-white/70 font-medium py-3">From</th>
                <th className="text-left text-white/70 font-medium py-3">To</th>
                <th className="text-left text-white/70 font-medium py-3">Amount</th>
                <th className="text-left text-white/70 font-medium py-3">Status</th>
                <th className="text-left text-white/70 font-medium py-3">AI Score</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4">
                    <span className="text-blue-400 font-mono text-sm">{tx.id}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-white/70 text-sm">{tx.timestamp}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-white font-mono text-sm">{tx.sender}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-white font-mono text-sm">{tx.recipient}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-white font-semibold">{tx.amount}</span>
                    <br />
                    <span className="text-white/50 text-xs">Fee: {tx.fee}</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tx.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        tx.fraudScore < 0.2 ? 'bg-green-400' : 
                        tx.fraudScore < 0.5 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                      <span className="text-white/70 text-sm">{(tx.fraudScore * 100).toFixed(0)}%</span>
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

export default Transactions;