import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  senderAddress: {
    type: String,
    required: true
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
  fraudScore: {
    type: Number,
    default: 0
  },
  isFraudulent: {
    type: Boolean,
    default: false
  },
  fraudReason: {
    type: String
  },
  metadata: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ senderAddress: 1 });
transactionSchema.index({ recipientAddress: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

