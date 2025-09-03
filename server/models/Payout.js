import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayoutBatch',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payoutId: {
    type: String,
    required: true,
    unique: true
  },
  recipientAddress: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  token: {
    type: String,
    default: 'SOL'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  signature: {
    type: String
  },
  estimatedFee: {
    type: Number
  },
  actualFee: {
    type: Number
  },
  failureReason: {
    type: String
  },
  retryCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
payoutSchema.index({ batch: 1 });
payoutSchema.index({ user: 1, createdAt: -1 });
payoutSchema.index({ payoutId: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ recipientAddress: 1 });

const Payout = mongoose.model('Payout', payoutSchema);

export default Payout;

