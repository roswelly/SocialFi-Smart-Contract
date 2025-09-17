const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic user information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  
  // Authentication
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Wallet addresses
  walletAddresses: [{
    address: {
      type: String,
      required: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{40}$/.test(v);
        },
        message: 'Invalid wallet address format'
      }
    },
    chainId: {
      type: Number,
      default: 1
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date,
      default: null
    }
  }],
  
  // Profile information
  avatar: {
    type: String,
    default: '/chats/noimg.svg'
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // Social links
  website: {
    type: String,
    default: ''
  },
  twitter: {
    type: String,
    default: ''
  },
  telegram: {
    type: String,
    default: ''
  },
  discord: {
    type: String,
    default: ''
  },
  github: {
    type: String,
    default: ''
  },
  
  // User statistics
  tokensCreated: {
    type: Number,
    default: 0
  },
  totalVolume: {
    type: String,
    default: '0'
  },
  totalVolumeUSD: {
    type: String,
    default: '0'
  },
  
  // Verification and status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  
  // Role and permissions
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  
  // Security
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  
  // Login tracking
  lastLoginAt: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'walletAddresses.address': 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for primary wallet address
userSchema.virtual('primaryWallet').get(function() {
  const primary = this.walletAddresses.find(wallet => wallet.isPrimary);
  return primary ? primary.address : null;
});

// Virtual for total tokens created
userSchema.virtual('tokensCount', {
  ref: 'Token',
  localField: '_id',
  foreignField: 'creatorAddress',
  count: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to add wallet address
userSchema.methods.addWalletAddress = function(address, chainId = 1) {
  const existingWallet = this.walletAddresses.find(
    wallet => wallet.address.toLowerCase() === address.toLowerCase()
  );
  
  if (existingWallet) {
    throw new Error('Wallet address already exists');
  }
  
  this.walletAddresses.push({
    address: address.toLowerCase(),
    chainId,
    isPrimary: this.walletAddresses.length === 0
  });
  
  return this.save();
};

// Instance method to set primary wallet
userSchema.methods.setPrimaryWallet = function(address) {
  this.walletAddresses.forEach(wallet => {
    wallet.isPrimary = wallet.address.toLowerCase() === address.toLowerCase();
  });
  
  return this.save();
};

// Instance method to verify wallet ownership
userSchema.methods.verifyWallet = function(address) {
  const wallet = this.walletAddresses.find(
    wallet => wallet.address.toLowerCase() === address.toLowerCase()
  );
  
  if (wallet) {
    wallet.verifiedAt = new Date();
    return this.save();
  }
  
  throw new Error('Wallet address not found');
};

// Static method to find by wallet address
userSchema.statics.findByWalletAddress = function(address) {
  return this.findOne({
    'walletAddresses.address': address.toLowerCase()
  });
};

// Static method to find top creators
userSchema.statics.findTopCreators = function(limit = 10) {
  return this.find({ isActive: true, isBanned: false })
    .sort({ tokensCreated: -1, totalVolumeUSD: -1 })
    .limit(limit);
};

module.exports = mongoose.model('User', userSchema);
