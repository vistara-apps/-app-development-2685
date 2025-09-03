import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatsCard = ({ title, value, change, isPositive, icon: Icon }) => {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/10 rounded-lg">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`flex items-center space-x-1 text-sm ${
          isPositive ? 'text-green-400' : 'text-red-400'
        }`}>
          {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span>{change}</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-white/70 text-sm">{title}</p>
    </div>
  );
};

export default StatsCard;