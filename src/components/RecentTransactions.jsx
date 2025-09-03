import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

const RecentTransactions = () => {
  const transactions = [
    {
      id: '1',
      type: 'received',
      amount: '+$2,450.00',
      address: '7xKX...9mPq',
      time: '2 min ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'sent',
      amount: '-$890.50',
      address: '4nQv...2kLs',
      time: '15 min ago',
      status: 'completed'
    },
    {
      id: '3',
      type: 'sent',
      amount: '-$1,200.00',
      address: '9pTr...5xVb',
      time: '1 hour ago',
      status: 'pending'
    },
    {
      id: '4',
      type: 'received',
      amount: '+$567.25',
      address: '2mKj...8nWp',
      time: '2 hours ago',
      status: 'completed'
    }
  ];

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Recent Transactions</h3>
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center space-x-3 p-3 hover:bg-white/5 rounded-lg transition-colors">
            <div className={`p-2 rounded-lg ${
              tx.type === 'received' ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {tx.type === 'received' ? (
                <ArrowDownLeft className="w-4 h-4 text-green-400" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-red-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-white font-medium">{tx.amount}</p>
                <div className="flex items-center space-x-2">
                  {tx.status === 'pending' && (
                    <Clock className="w-3 h-3 text-yellow-400" />
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tx.status === 'completed' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
              <p className="text-white/70 text-sm">{tx.address}</p>
              <p className="text-white/50 text-xs">{tx.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 text-center text-blue-400 hover:text-blue-300 text-sm font-medium">
        View All Transactions
      </button>
    </div>
  );
};

export default RecentTransactions;