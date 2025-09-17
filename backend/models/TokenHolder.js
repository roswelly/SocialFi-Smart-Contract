const mongoose = require('mongoose');

const tokenHolderSchema = new mongoose.Schema({
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

  // Holder address
  holderAddress: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid holder address format'
    }
  },

  // Balance information
  balance: {
    type: String,
    required: true,
    default: '0'
  },
  balanceFormatted: {
    type: String,
    default: '0'
  },

  // Percentage of total supply
  percentageOfSupply: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Value information
  valueUSD: {
    type: String,
    default: '0'
  },
  valueETH: {
    type: String,
    default: '0'
  },

  // Transaction counts
  buyCount: {
    type: Number,
    default: 0
  },
  sellCount: {
    type: Number,
    default: 0
  },

  // First and last transaction
  firstTxHash: {
    type: String,
    default: ''
  },
  lastTxHash: {
    type: String,
    default: ''
  },
  firstTxTimestamp: {
    type: Date,
    default: null
  },
  lastTxTimestamp: {
    type: Date,
    default: null
  },

  // Chain information
  chainId: {
    type: Number,
    required: true,
    default: 1
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Tags (e.g., 'whale', 'early_holder', 'liquidity_provider')
  tags: [{
    type: String,
    trim: true
  }],

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

// Compound index for unique token-holder combination
tokenHolderSchema.index({ tokenId: 1, holderAddress: 1 }, { unique: true });
tokenHolderSchema.index({ tokenAddress: 1, holderAddress: 1 });
tokenHolderSchema.index({ holderAddress: 1 });
tokenHolderSchema.index({ balance: -1 });
tokenHolderSchema.index({ valueUSD: -1 });
tokenHolderSchema.index({ percentageOfSupply: -1 });
tokenHolderSchema.index({ createdAt: -1 });
tokenHolderSchema.index({ chainId: 1 });

// Virtual for total transaction count
tokenHolderSchema.virtual('totalTxCount').get(function() {
  return this.buyCount + this.sellCount;
});

// Virtual for holder type based on balance
tokenHolderSchema.virtual('holderType').get(function() {
  const percentage = this.percentageOfSupply;
  if (percentage >= 1) return 'whale';
  if (percentage >= 0.1) return 'large_holder';
  if (percentage >= 0.01) return 'medium_holder';
  return 'small_holder';
});

// Pre-save middleware to update the updatedAt field
tokenHolderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find holders by token
tokenHolderSchema.statics.findByToken = function(tokenAddress, limit = 100) {
  return this.find({ tokenAddress: tokenAddress.toLowerCase() })
    .sort({ balance: -1 })
    .limit(limit);
};

// Static method to find holders by address
tokenHolderSchema.statics.findByAddress = function(holderAddress, limit = 100) {
  return this.find({ holderAddress: holderAddress.toLowerCase() })
    .sort({ valueUSD: -1 })
    .limit(limit);
};

// Static method to find top holders
tokenHolderSchema.statics.findTopHolders = function(tokenAddress, limit = 10) {
  return this.find({ tokenAddress: tokenAddress.toLowerCase() })
    .sort({ balance: -1 })
    .limit(limit);
};

// Static method to find whale holders
tokenHolderSchema.statics.findWhales = function(tokenAddress, limit = 50) {
  return this.find({ 
    tokenAddress: tokenAddress.toLowerCase(),
    percentageOfSupply: { $gte: 1 }
  })
    .sort({ percentageOfSupply: -1 })
    .limit(limit);
};

// Instance method to update balance
tokenHolderSchema.methods.updateBalance = function(newBalance, totalSupply) {
  this.balance = newBalance;
  
  if (totalSupply && parseFloat(totalSupply) > 0) {
    const balanceNum = parseFloat(newBalance);
    const supplyNum = parseFloat(totalSupply);
    this.percentageOfSupply = (balanceNum / supplyNum) * 100;
  }
  
  return this.save();
};

// Instance method to add transaction
tokenHolderSchema.methods.addTransaction = function(txHash, timestamp, isBuy) {
  if (isBuy) {
    this.buyCount += 1;
  } else {
    this.sellCount += 1;
  }
  
  if (!this.firstTxHash) {
    this.firstTxHash = txHash;
    this.firstTxTimestamp = timestamp;
  }
  
  this.lastTxHash = txHash;
  this.lastTxTimestamp = timestamp;
  
  return this.save();
};

module.exports = mongoose.model('TokenHolder', tokenHolderSchema);
