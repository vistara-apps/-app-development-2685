import mongoose from 'mongoose';

const payoutBatchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batchId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'scheduled', 'processing', 'completed', 'completed_with_errors', 'failed', 'cancelled'],
    default: 'created'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  token: {
    type: String,
    default: 'SOL'
  },
  recipientCount: {
    type: Number,
    required: true
  },
  scheduledFor: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringSchedule: {
    type: String // Cron expression
  },
  nextScheduledDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for payouts
payoutBatchSchema.virtual('payouts', {
  ref: 'Payout',
  localField: '_id',
  foreignField: 'batch',
  justOne: false
});

// Index for faster queries
payoutBatchSchema.index({ user: 1, createdAt: -1 });
payoutBatchSchema.index({ batchId: 1 });
payoutBatchSchema.index({ status: 1 });
payoutBatchSchema.index({ scheduledFor: 1 });
payoutBatchSchema.index({ isRecurring: 1, nextScheduledDate: 1 });

const PayoutBatch = mongoose.model('PayoutBatch', payoutBatchSchema);

export default PayoutBatch;

