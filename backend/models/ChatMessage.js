const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
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

  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userAddress: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid user address format'
    }
  },
  username: {
    type: String,
    required: true,
    trim: true
  },

  // Message content
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'link', 'system'],
    default: 'text'
  },

  // Media content (for images/links)
  mediaUrl: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String,
    default: ''
  },

  // Message metadata
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },

  // Moderation
  isModerated: {
    type: Boolean,
    default: false
  },
  moderationReason: {
    type: String,
    default: ''
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date,
    default: null
  },

  // Engagement
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userAddress: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  dislikes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userAddress: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Replies
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
  }],

  // Chain information
  chainId: {
    type: Number,
    required: true,
    default: 1
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
chatMessageSchema.index({ tokenId: 1 });
chatMessageSchema.index({ tokenAddress: 1 });
chatMessageSchema.index({ userId: 1 });
chatMessageSchema.index({ userAddress: 1 });
chatMessageSchema.index({ createdAt: -1 });
chatMessageSchema.index({ isDeleted: 1 });
chatMessageSchema.index({ isModerated: 1 });
chatMessageSchema.index({ chainId: 1 });

// Virtual for like count
chatMessageSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for dislike count
chatMessageSchema.virtual('dislikeCount').get(function() {
  return this.dislikes.length;
});

// Virtual for reply count
chatMessageSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Virtual for engagement score
chatMessageSchema.virtual('engagementScore').get(function() {
  return this.likes.length - this.dislikes.length + (this.replies.length * 2);
});

// Pre-save middleware to update the updatedAt field
chatMessageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find messages by token
chatMessageSchema.statics.findByToken = function(tokenAddress, limit = 100, skip = 0) {
  return this.find({ 
    tokenAddress: tokenAddress.toLowerCase(),
    isDeleted: false,
    isModerated: false
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username avatar')
    .populate('replyTo', 'message userId username');
};

// Static method to find messages by user
chatMessageSchema.statics.findByUser = function(userAddress, limit = 100) {
  return this.find({ 
    userAddress: userAddress.toLowerCase(),
    isDeleted: false
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('tokenId', 'name symbol logo');
};

// Static method to find recent messages
chatMessageSchema.statics.findRecent = function(limit = 50) {
  return this.find({ 
    isDeleted: false,
    isModerated: false
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username avatar')
    .populate('tokenId', 'name symbol logo');
};

// Instance method to add like
chatMessageSchema.methods.addLike = function(userId, userAddress) {
  const existingLike = this.likes.find(like => 
    like.userId.toString() === userId.toString()
  );
  
  if (!existingLike) {
    this.likes.push({ userId, userAddress });
    
    // Remove dislike if exists
    this.dislikes = this.dislikes.filter(dislike => 
      dislike.userId.toString() !== userId.toString()
    );
  }
  
  return this.save();
};

// Instance method to add dislike
chatMessageSchema.methods.addDislike = function(userId, userAddress) {
  const existingDislike = this.dislikes.find(dislike => 
    dislike.userId.toString() === userId.toString()
  );
  
  if (!existingDislike) {
    this.dislikes.push({ userId, userAddress });
    
    // Remove like if exists
    this.likes = this.likes.filter(like => 
      like.userId.toString() !== userId.toString()
    );
  }
  
  return this.save();
};

// Instance method to remove reaction
chatMessageSchema.methods.removeReaction = function(userId) {
  this.likes = this.likes.filter(like => 
    like.userId.toString() !== userId.toString()
  );
  this.dislikes = this.dislikes.filter(dislike => 
    dislike.userId.toString() !== userId.toString()
  );
  
  return this.save();
};

// Instance method to edit message
chatMessageSchema.methods.editMessage = function(newMessage) {
  this.message = newMessage;
  this.isEdited = true;
  this.updatedAt = new Date();
  
  return this.save();
};

// Instance method to delete message
chatMessageSchema.methods.deleteMessage = function() {
  this.isDeleted = true;
  this.updatedAt = new Date();
  
  return this.save();
};

// Instance method to moderate message
chatMessageSchema.methods.moderate = function(reason, moderatorId) {
  this.isModerated = true;
  this.moderationReason = reason;
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  
  return this.save();
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
