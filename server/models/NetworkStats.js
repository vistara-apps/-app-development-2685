import mongoose from 'mongoose';

const networkStatsSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  averageFee: {
    type: Number,
    required: true
  },
  medianFee: {
    type: Number,
    required: true
  },
  minFee: {
    type: Number,
    required: true
  },
  maxFee: {
    type: Number,
    required: true
  },
  transactionCount: {
    type: Number,
    required: true
  },
  blockHeight: {
    type: Number,
    required: true
  },
  tps: {
    type: Number, // Transactions per second
    required: true
  },
  networkLoad: {
    type: Number, // 0-1 value representing network load
    required: true,
    min: 0,
    max: 1
  },
  predictedFeeIncrease: {
    type: Number // Predicted percentage increase in fees in next hour
  },
  recommendedFee: {
    type: Number // Recommended fee for standard transactions
  },
  recommendedPriorityFee: {
    type: Number // Recommended fee for priority transactions
  }
}, {
  timestamps: true
});

// Index for faster queries
networkStatsSchema.index({ timestamp: -1 });
networkStatsSchema.index({ blockHeight: 1 });

// Static method to get latest stats
networkStatsSchema.statics.getLatest = async function() {
  return this.findOne().sort({ timestamp: -1 });
};

// Static method to get average fee over time period
networkStatsSchema.statics.getAverageFeeOverTime = async function(hours = 24) {
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const result = await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startTime }
      }
    },
    {
      $group: {
        _id: null,
        averageFee: { $avg: '$averageFee' },
        medianFee: { $avg: '$medianFee' },
        minFee: { $min: '$minFee' },
        maxFee: { $max: '$maxFee' },
        avgTps: { $avg: '$tps' },
        avgNetworkLoad: { $avg: '$networkLoad' }
      }
    }
  ]);
  
  return result[0] || null;
};

// Static method to get fee recommendations
networkStatsSchema.statics.getFeeRecommendations = async function() {
  const latest = await this.getLatest();
  
  if (!latest) {
    return {
      standard: 0.000005, // Default values if no data
      fast: 0.00001,
      priority: 0.00002
    };
  }
  
  return {
    standard: latest.recommendedFee,
    fast: latest.recommendedFee * 1.5,
    priority: latest.recommendedPriorityFee
  };
};

const NetworkStats = mongoose.model('NetworkStats', networkStatsSchema);

export default NetworkStats;

