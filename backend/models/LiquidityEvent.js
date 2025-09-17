const mongoose = require('mongoose');

const liquidityEventSchema = new mongoose.Schema({
  // Token reference
  tokenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token',
    required: true
  },
  tokenAddress: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid token address format'
    }
  },

  // Event details
  type: {
    type: String,
    required: true,
    enum: ['add', 'remove'],
    default: 'add'
  },

  // Provider address
  providerAddress: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid provider address format'
    }
  },

  // Amounts
  ethAmount: {
    type: String,
    required: true,
    default: '0'
  },
  tokenAmount: {
    type: String,
    required: true,
    default: '0'
  },

  // Price information
  tokenPrice: {
    type: String,
    required: true,
    default: '0'
  },
  tokenPriceUSD: {
    type: String,
    default: '0'
  },

  // Liquidity pool information
  liquidityPoolAddress: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid liquidity pool address format'
    }
  },

  // Transaction information
  txHash: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{64}$/.test(v);
      },
      message: 'Invalid transaction hash format'
    }
  },
  blockNumber: {
    type: Number,
    required: true
  },
  blockTimestamp: {
    type: Date,
    required: true
  },

  // Chain information
  chainId: {
    type: Number,
    required: true,
    default: 1
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'confirmed'
  },

  // Additional metadata
  methodName: {
    type: String,
    default: ''
  },
  inputData: {
    type: String,
    default: ''
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
liquidityEventSchema.index({ tokenId: 1 });
liquidityEventSchema.index({ tokenAddress: 1 });
liquidityEventSchema.index({ providerAddress: 1 });
liquidityEventSchema.index({ type: 1 });
liquidityEventSchema.index({ blockNumber: -1 });
liquidityEventSchema.index({ blockTimestamp: -1 });
liquidityEventSchema.index({ createdAt: -1 });
liquidityEventSchema.index({ chainId: 1 });

// Virtual for event value in USD
liquidityEventSchema.virtual('valueUSD').get(function() {
  if (this.tokenPriceUSD && this.tokenAmount) {
    const price = parseFloat(this.tokenPriceUSD);
    const amount = parseFloat(this.tokenAmount);
    return (price * amount).toString();
  }
  return '0';
});

// Pre-save middleware to update the updatedAt field
liquidityEventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find liquidity events by token
liquidityEventSchema.statics.findByToken = function(tokenAddress, limit = 100) {
  return this.find({ tokenAddress: tokenAddress.toLowerCase() })
    .sort({ blockTimestamp: -1 })
    .limit(limit);
};

// Static method to find liquidity events by provider
liquidityEventSchema.statics.findByProvider = function(providerAddress, limit = 100) {
  return this.find({ providerAddress: providerAddress.toLowerCase() })
    .sort({ blockTimestamp: -1 })
    .limit(limit);
};

// Static method to find recent liquidity events
liquidityEventSchema.statics.findRecent = function(limit = 50) {
  return this.find({ status: 'confirmed' })
    .sort({ blockTimestamp: -1 })
    .limit(limit);
};

// Instance method to calculate total value
liquidityEventSchema.methods.calculateTotalValue = function(ethPriceUSD) {
  if (this.ethAmount && ethPriceUSD) {
    const ethAmount = parseFloat(this.ethAmount);
    const ethPrice = parseFloat(ethPriceUSD);
    return (ethAmount * ethPrice).toString();
  }
  return '0';
};

module.exports = mongoose.model('LiquidityEvent', liquidityEventSchema);
