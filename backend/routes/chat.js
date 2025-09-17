const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const ChatMessage = require('../models/ChatMessage');
const Token = require('../models/Token');
const { authenticateToken, optionalAuth, requireModerator } = require('../middleware/auth');
const { validateAddress } = require('../middleware/validation');

const router = express.Router();

// GET /api/chat/:tokenAddress - Get chat messages for a token
router.get('/:tokenAddress', [
  param('tokenAddress').custom(validateAddress).withMessage('Invalid token address'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
  query('sort').optional().isIn(['newest', 'oldest', 'popular']).withMessage('Invalid sort option')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tokenAddress } = req.params;
    const { page = 1, pageSize = 50, sort = 'newest' } = req.query;

    // Check if token exists
    const token = await Token.findOne({ address: tokenAddress.toLowerCase() });
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'popular':
        sortObj = { 'likes.length': -1, createdAt: -1 };
        break;
      default: // newest
        sortObj = { createdAt: -1 };
    }

    const [messages, totalCount] = await Promise.all([
      ChatMessage.find({
        tokenAddress: tokenAddress.toLowerCase(),
        isDeleted: false,
        isModerated: false
      })
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username avatar')
        .populate('replyTo', 'message userId username')
        .populate('replies', 'message userId username'),
      ChatMessage.countDocuments({
        tokenAddress: tokenAddress.toLowerCase(),
        isDeleted: false,
        isModerated: false
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: messages,
      totalCount,
      currentPage: parseInt(page),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// POST /api/chat/:tokenAddress - Add a new chat message
router.post('/:tokenAddress', [
  authenticateToken,
  param('tokenAddress').custom(validateAddress).withMessage('Invalid token address'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('messageType').optional().isIn(['text', 'image', 'link', 'system']).withMessage('Invalid message type'),
  body('mediaUrl').optional().isURL().withMessage('Invalid media URL'),
  body('replyTo').optional().isMongoId().withMessage('Invalid reply message ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tokenAddress } = req.params;
    const { message, messageType = 'text', mediaUrl = '', replyTo } = req.body;

    // Check if token exists
    const token = await Token.findOne({ address: tokenAddress.toLowerCase() });
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    // Check if replying to a valid message
    if (replyTo) {
      const replyMessage = await ChatMessage.findById(replyTo);
      if (!replyMessage || replyMessage.tokenAddress.toLowerCase() !== tokenAddress.toLowerCase()) {
        return res.status(400).json({ error: 'Invalid reply message' });
      }
    }

    // Create new chat message
    const chatMessage = new ChatMessage({
      tokenId: token._id,
      tokenAddress: tokenAddress.toLowerCase(),
      userId: req.user._id,
      userAddress: req.user.primaryWallet || req.user.walletAddresses[0]?.address,
      username: req.user.username,
      message,
      messageType,
      mediaUrl,
      replyTo,
      chainId: token.chainId
    });

    await chatMessage.save();

    // If this is a reply, update the parent message
    if (replyTo) {
      await ChatMessage.findByIdAndUpdate(replyTo, {
        $push: { replies: chatMessage._id }
      });
    }

    // Populate user info for response
    await chatMessage.populate('userId', 'username avatar');
    if (replyTo) {
      await chatMessage.populate('replyTo', 'message userId username');
    }

    res.status(201).json({
      message: 'Chat message added successfully',
      data: chatMessage
    });
  } catch (error) {
    console.error('Error adding chat message:', error);
    res.status(500).json({ error: 'Failed to add chat message' });
  }
});

// PUT /api/chat/:messageId - Edit a chat message
router.put('/:messageId', [
  authenticateToken,
  param('messageId').isMongoId().withMessage('Invalid message ID'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { messageId } = req.params;
    const { message } = req.body;

    // Find the message
    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user owns the message or is moderator
    if (chatMessage.userId.toString() !== req.user._id.toString() && req.user.role === 'user') {
      return res.status(403).json({ error: 'You can only edit your own messages' });
    }

    // Update the message
    await chatMessage.editMessage(message);

    // Populate user info for response
    await chatMessage.populate('userId', 'username avatar');

    res.json({
      message: 'Message updated successfully',
      data: chatMessage
    });
  } catch (error) {
    console.error('Error updating chat message:', error);
    res.status(500).json({ error: 'Failed to update chat message' });
  }
});

// DELETE /api/chat/:messageId - Delete a chat message
router.delete('/:messageId', [
  authenticateToken,
  param('messageId').isMongoId().withMessage('Invalid message ID')
], async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find the message
    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user owns the message or is moderator/admin
    if (chatMessage.userId.toString() !== req.user._id.toString() && 
        req.user.role === 'user') {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    // Delete the message
    await chatMessage.deleteMessage();

    res.json({
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat message:', error);
    res.status(500).json({ error: 'Failed to delete chat message' });
  }
});

// POST /api/chat/:messageId/like - Like a message
router.post('/:messageId/like', [
  authenticateToken,
  param('messageId').isMongoId().withMessage('Invalid message ID')
], async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find the message
    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Add like
    await chatMessage.addLike(req.user._id, req.user.primaryWallet || req.user.walletAddresses[0]?.address);

    res.json({
      message: 'Message liked successfully',
      data: {
        likeCount: chatMessage.likeCount,
        dislikeCount: chatMessage.dislikeCount
      }
    });
  } catch (error) {
    console.error('Error liking message:', error);
    res.status(500).json({ error: 'Failed to like message' });
  }
});

// POST /api/chat/:messageId/dislike - Dislike a message
router.post('/:messageId/dislike', [
  authenticateToken,
  param('messageId').isMongoId().withMessage('Invalid message ID')
], async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find the message
    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Add dislike
    await chatMessage.addDislike(req.user._id, req.user.primaryWallet || req.user.walletAddresses[0]?.address);

    res.json({
      message: 'Message disliked successfully',
      data: {
        likeCount: chatMessage.likeCount,
        dislikeCount: chatMessage.dislikeCount
      }
    });
  } catch (error) {
    console.error('Error disliking message:', error);
    res.status(500).json({ error: 'Failed to dislike message' });
  }
});

// DELETE /api/chat/:messageId/reaction - Remove reaction from message
router.delete('/:messageId/reaction', [
  authenticateToken,
  param('messageId').isMongoId().withMessage('Invalid message ID')
], async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find the message
    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Remove reaction
    await chatMessage.removeReaction(req.user._id);

    res.json({
      message: 'Reaction removed successfully',
      data: {
        likeCount: chatMessage.likeCount,
        dislikeCount: chatMessage.dislikeCount
      }
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

// POST /api/chat/:messageId/moderate - Moderate a message (moderator/admin only)
router.post('/:messageId/moderate', [
  authenticateToken,
  requireModerator,
  param('messageId').isMongoId().withMessage('Invalid message ID'),
  body('reason').trim().isLength({ min: 1, max: 500 }).withMessage('Moderation reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { messageId } = req.params;
    const { reason } = req.body;

    // Find the message
    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Moderate the message
    await chatMessage.moderate(reason, req.user._id);

    res.json({
      message: 'Message moderated successfully',
      data: chatMessage
    });
  } catch (error) {
    console.error('Error moderating message:', error);
    res.status(500).json({ error: 'Failed to moderate message' });
  }
});

// GET /api/chat/user/:userAddress - Get messages by user
router.get('/user/:userAddress', [
  param('userAddress').custom(validateAddress).withMessage('Invalid user address'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100')
], async (req, res) => {
  try {
    const { userAddress } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [messages, totalCount] = await Promise.all([
      ChatMessage.find({
        userAddress: userAddress.toLowerCase(),
        isDeleted: false
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('tokenId', 'name symbol logo'),
      ChatMessage.countDocuments({
        userAddress: userAddress.toLowerCase(),
        isDeleted: false
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: messages,
      totalCount,
      currentPage: parseInt(page),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({ error: 'Failed to fetch user messages' });
  }
});

module.exports = router;
