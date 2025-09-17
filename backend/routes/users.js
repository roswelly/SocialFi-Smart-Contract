const express = require('express');
const { query, param, validationResult } = require('express-validator');
const User = require('../models/User');
const Token = require('../models/Token');
const { authenticateToken, requireAdmin, requireModerator } = require('../middleware/auth');
const { validateAddress } = require('../middleware/validation');

const router = express.Router();

// GET /api/users - Get all users (admin only)
router.get('/', [authenticateToken, requireAdmin], [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
  query('role').optional().isIn(['user', 'moderator', 'admin']).withMessage('Invalid role'),
  query('verified').optional().isBoolean().withMessage('Verified must be true or false'),
  query('active').optional().isBoolean().withMessage('Active must be true or false'),
  query('search').optional().isString().withMessage('Search must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      pageSize = 20,
      role,
      verified,
      active,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (verified !== undefined) filter.isVerified = verified === 'true';
    if (active !== undefined) filter.isActive = active === 'true';
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: users,
      totalCount,
      currentPage: parseInt(page),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/top-creators - Get top token creators
router.get('/top-creators', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const users = await User.find({ isActive: true, isBanned: false })
      .select('username avatar walletAddresses tokensCreated totalVolumeUSD')
      .sort({ tokensCreated: -1, totalVolumeUSD: -1 })
      .limit(parseInt(limit));

    res.json({ data: users });
  } catch (error) {
    console.error('Error fetching top creators:', error);
    res.status(500).json({ error: 'Failed to fetch top creators' });
  }
});

// GET /api/users/address/:address - Get user by wallet address
router.get('/address/:address', [
  param('address').custom(validateAddress).withMessage('Invalid wallet address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address } = req.params;
    
    const user = await User.findOne({
      'walletAddresses.address': address.toLowerCase()
    }).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: user });
  } catch (error) {
    console.error('Error fetching user by address:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', [
  authenticateToken,
  param('id').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    
    // Users can only view their own profile unless they're admin/moderator
    if (req.user.role !== 'admin' && req.user.role !== 'moderator' && req.user._id.toString() !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /api/users/:id - Update user (admin/moderator or self)
router.put('/:id', [
  authenticateToken,
  param('id').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;
    
    // Users can only update their own profile unless they're admin/moderator
    if (req.user.role !== 'admin' && req.user.role !== 'moderator' && req.user._id.toString() !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Regular users cannot change their role
    if (req.user.role === 'user' && updateData.role) {
      delete updateData.role;
    }

    // Only admins can change roles
    if (req.user.role !== 'admin' && updateData.role) {
      delete updateData.role;
    }

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email; // Email changes should go through auth routes
    delete updateData.username; // Username changes should go through auth routes

    const user = await User.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', [
  authenticateToken,
  requireAdmin,
  param('id').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.query;
    
    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete - mark as inactive instead of removing
    user.isActive = false;
    user.isBanned = true;
    await user.save();

    res.json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// POST /api/users/:id/ban - Ban user (admin/moderator only)
router.post('/:id/ban', [
  authenticateToken,
  requireModerator,
  param('id').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    
    // Prevent moderators from banning admins
    if (req.user.role === 'moderator') {
      const targetUser = await User.findById(id);
      if (targetUser && targetUser.role === 'admin') {
        return res.status(403).json({ error: 'Moderators cannot ban administrators' });
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isBanned: true, isActive: false, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User banned successfully',
      data: user
    });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// POST /api/users/:id/unban - Unban user (admin/moderator only)
router.post('/:id/unban', [
  authenticateToken,
  requireModerator,
  param('id').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isBanned: false, isActive: true, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User unbanned successfully',
      data: user
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

// GET /api/users/:id/tokens - Get tokens created by user
router.get('/:id/tokens', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { page = 1, pageSize = 20 } = req.query;
    
    // Get user's wallet addresses
    const user = await User.findById(id).select('walletAddresses');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const walletAddresses = user.walletAddresses.map(wallet => wallet.address);
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [tokens, totalCount] = await Promise.all([
      Token.find({ creatorAddress: { $in: walletAddresses } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('liquidityEventsCount')
        .populate('transactionsCount'),
      Token.countDocuments({ creatorAddress: { $in: walletAddresses } })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: tokens,
      totalCount,
      currentPage: parseInt(page),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    res.status(500).json({ error: 'Failed to fetch user tokens' });
  }
});

// GET /api/users/:id/stats - Get user statistics
router.get('/:id/stats', [
  param('id').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    
    const user = await User.findById(id).select('walletAddresses');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const walletAddresses = user.walletAddresses.map(wallet => wallet.address);
    
    // Get user statistics
    const [tokenCount, totalVolume] = await Promise.all([
      Token.countDocuments({ creatorAddress: { $in: walletAddresses } }),
      Token.aggregate([
        { $match: { creatorAddress: { $in: walletAddresses } } },
        { $group: { _id: null, totalVolume: { $sum: { $toDouble: '$volume24hUSD' } } } }
      ])
    ]);

    const stats = {
      tokensCreated: tokenCount,
      totalVolumeUSD: totalVolume[0]?.totalVolume || 0,
      walletAddresses: user.walletAddresses.length,
      primaryWallet: user.walletAddresses.find(wallet => wallet.isPrimary)?.address || null
    };

    res.json({ data: stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

module.exports = router;
