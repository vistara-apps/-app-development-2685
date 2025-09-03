import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  apiKey: {
    type: String,
    unique: true
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'basic', 'pro'],
    default: 'free'
  },
  isSubscriptionActive: {
    type: Boolean,
    default: true
  },
  subscriptionExpiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  transactionCount: {
    type: Number,
    default: 0
  },
  transactionLimit: {
    type: Number,
    default: 100 // Free tier limit
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Generate API key if not exists
  if (!this.apiKey) {
    this.generateApiKey();
  }
  
  // Set transaction limit based on subscription tier
  this.updateTransactionLimit();
  
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate API key
userSchema.methods.generateApiKey = function() {
  // Generate a random API key with 'spai_' prefix
  const apiKey = 'spai_' + crypto.randomBytes(16).toString('hex');
  this.apiKey = apiKey;
  return apiKey;
};

// Update subscription tier
userSchema.methods.updateSubscription = function(tier) {
  this.subscriptionTier = tier;
  this.isSubscriptionActive = true;
  this.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  this.updateTransactionLimit();
};

// Update transaction limit based on subscription tier
userSchema.methods.updateTransactionLimit = function() {
  switch (this.subscriptionTier) {
    case 'free':
      this.transactionLimit = 100;
      break;
    case 'basic':
      this.transactionLimit = 1000;
      break;
    case 'pro':
      this.transactionLimit = 5000;
      break;
    default:
      this.transactionLimit = 100;
  }
};

const User = mongoose.model('User', userSchema);

export default User;

