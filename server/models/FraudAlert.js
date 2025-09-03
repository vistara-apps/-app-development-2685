import mongoose from 'mongoose';

const fraudAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  alertId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['pattern', 'velocity', 'amount', 'address', 'network', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: Object
  },
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved', 'false_positive', 'confirmed_fraud'],
    default: 'open'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  resolution: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
fraudAlertSchema.index({ user: 1, createdAt: -1 });
fraudAlertSchema.index({ transaction: 1 });
fraudAlertSchema.index({ alertId: 1 });
fraudAlertSchema.index({ status: 1 });
fraudAlertSchema.index({ severity: 1 });
fraudAlertSchema.index({ type: 1 });

// Method to resolve alert
fraudAlertSchema.methods.resolve = function(status, resolution, userId) {
  this.status = status;
  this.resolution = resolution;
  this.resolvedBy = userId;
  this.resolvedAt = new Date();
  return this.save();
};

const FraudAlert = mongoose.model('FraudAlert', fraudAlertSchema);

export default FraudAlert;

