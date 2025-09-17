const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  // Basic token information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  symbol: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10,
    uppercase: true
  },
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address format'
    }
  },
  chainId: {
    type: Number,
    required: true,
    default: 1 // Ethereum mainnet
  },
  
  // Creator information
  creatorAddress: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid creator address format'
    }
  },
  
  // Token metadata
  logo: {
    type: String,
    default: '/chats/noimg.svg'
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  
  // Social links
  website: {
    type: String,
    default: ''
  },
  youtube: {
    type: String,
    default: ''
  },
  discord: {
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
  
  // Token economics
  totalSupply: {
    type: String,
    default: '0'
  },
  circulatingSupply: {
    type: String,
    default: '0'
  },
  
  // Price and market data
  currentPrice: {
    type: String,
    default: '0'
  },
  currentPriceUSD: {
    type: String,
    default: '0'
  },
  marketCap: {
    type: String,
    default: '0'
  },
  marketCapUSD: {
    type: String,
    default: '0'
  },
  
  // Liquidity information
  totalLiquidity: {
    type: String,
    default: '0'
  },
  totalLiquidityUSD: {
    type: String,
    default: '0'
  },
  
  // Trading statistics
  volume24h: {
    type: String,
    default: '0'
  },
  volume24hUSD: {
    type: String,
    default: '0'
  },
  priceChange24h: {
    type: String,
    default: '0'
  },
  priceChange24hPercent: {
    type: String,
    default: '0'
  },
  
  // Status and verification
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isHoneypot: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  latestTransactionTimestamp: {
    type: Date,
    default: Date.now
  },
  
  // Contract deployment info
  deploymentTxHash: {
    type: String,
    default: ''
  },
  deploymentBlock: {
    type: Number,
    default: 0
  },
  
  // Tags and categories
  tags: [{
    type: String,
    trim: true
  }],
  
  // Audit information
  auditScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'extreme'],
    default: 'medium'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
tokenSchema.index({ address: 1 });
tokenSchema.index({ creatorAddress: 1 });
tokenSchema.index({ chainId: 1 });
tokenSchema.index({ createdAt: -1 });
tokenSchema.index({ currentPriceUSD: -1 });
tokenSchema.index({ marketCapUSD: -1 });
tokenSchema.index({ volume24hUSD: -1 });
tokenSchema.index({ isVerified: 1 });
tokenSchema.index({ isActive: 1 });

// Virtual for liquidity events count
tokenSchema.virtual('liquidityEventsCount', {
  ref: 'LiquidityEvent',
  localField: '_id',
  foreignField: 'tokenId',
  count: true
});

// Virtual for transactions count
tokenSchema.virtual('transactionsCount', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'tokenId',
  count: true
});

// Virtual for holders count
tokenSchema.virtual('holdersCount', {
  ref: 'TokenHolder',
  localField: '_id',
  foreignField: 'tokenId',
  count: true
});

// Pre-save middleware to update the updatedAt field
tokenSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find tokens by creator
tokenSchema.statics.findByCreator = function(creatorAddress) {
  return this.find({ creatorAddress: creatorAddress.toLowerCase() });
};

// Static method to find trending tokens
tokenSchema.statics.findTrending = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ volume24hUSD: -1, priceChange24hPercent: -1 })
    .limit(limit);
};

// Instance method to update price data
tokenSchema.methods.updatePriceData = function(priceData) {
  this.currentPrice = priceData.price;
  this.currentPriceUSD = priceData.priceUSD;
  this.marketCap = priceData.marketCap;
  this.marketCapUSD = priceData.marketCapUSD;
  this.volume24h = priceData.volume24h;
  this.volume24hUSD = priceData.volume24hUSD;
  this.priceChange24h = priceData.priceChange24h;
  this.priceChange24hPercent = priceData.priceChange24hPercent;
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Token', tokenSchema);
