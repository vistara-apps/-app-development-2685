import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import StatsCard from './StatsCard';
import TransactionChart from './TransactionChart';
import RecentTransactions from './RecentTransactions';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Volume',
      value: '$847.5K',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign
    },
    {
      title: 'Transactions',
      value: '2,847',
      change: '+8.2%',
      isPositive: true,
      icon: Activity
    },
    {
      title: 'Active Users',
      value: '1,247',
      change: '+3.1%',
      isPositive: true,
      icon: Users
    },
    {
      title: 'Success Rate',
      value: '99.8%',
      change: '+0.2%',
      isPositive: true,
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/70">Welcome back! Here's what's happening with your payments.</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
          Create Payment
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionChart />
        </div>
        <div>
          <RecentTransactions />
        </div>
      </div>

      {/* AI Insights */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-4">AI Insights</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
            <div>
              <p className="text-white font-medium">Fraud Risk: Low</p>
              <p className="text-white/70 text-sm">No suspicious patterns detected in the last 24 hours</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
            <div>
              <p className="text-white font-medium">Optimal Fee Window</p>
              <p className="text-white/70 text-sm">Current network fees are 15% below average. Good time for batch payouts.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
            <div>
              <p className="text-white font-medium">Peak Traffic Alert</p>
              <p className="text-white/70 text-sm">Transaction volume expected to increase by 20% in the next 2 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;