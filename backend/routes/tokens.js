const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const Token = require('../models/Token');
const Transaction = require('../models/Transaction');
const { authenticateToken } = require('../middleware/auth');
const { validateAddress } = require('../middleware/validation');

const router = express.Router();

// Validation middleware
const validateTokenData = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('symbol').trim().isLength({ min: 1, max: 10 }).withMessage('Symbol must be between 1 and 10 characters'),
  body('address').custom(validateAddress).withMessage('Invalid token address'),
  body('creatorAddress').custom(validateAddress).withMessage('Invalid creator address'),
  body('chainId').isInt({ min: 1 }).withMessage('Invalid chain ID'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description too long'),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('youtube').optional().isURL().withMessage('Invalid YouTube URL'),
  body('discord').optional().isURL().withMessage('Invalid Discord URL'),
  body('twitter').optional().isURL().withMessage('Invalid Twitter URL'),
  body('telegram').optional().isURL().withMessage('Invalid Telegram URL')
];

// GET /api/tokens - Get all tokens with pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
  query('sortBy').optional().isIn(['createdAt', 'currentPriceUSD', 'marketCapUSD', 'volume24hUSD', 'priceChange24hPercent']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('chainId').optional().isInt({ min: 1 }).withMessage('Invalid chain ID'),
  query('verified').optional().isBoolean().withMessage('Verified must be true or false'),
  query('active').optional().isBoolean().withMessage('Active must be true or false')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      chainId,
      verified,
      active,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    if (chainId) filter.chainId = parseInt(chainId);
    if (verified !== undefined) filter.isVerified = verified === 'true';
    if (active !== undefined) filter.isActive = active === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [tokens, totalCount] = await Promise.all([
      Token.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('liquidityEventsCount')
        .populate('transactionsCount')
        .populate('holdersCount'),
      Token.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      tokens: [],
      data: tokens,
      totalCount,
      currentPage: parseInt(page),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
});

// GET /api/tokens/trending - Get trending tokens
router.get('/trending', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const tokens = await Token.find({ isActive: true })
      .sort({ volume24hUSD: -1, priceChange24hPercent: -1 })
      .limit(parseInt(limit))
      .populate('liquidityEventsCount')
      .populate('transactionsCount');

    res.json({ data: tokens });
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    res.status(500).json({ error: 'Failed to fetch trending tokens' });
  }
});

// GET /api/tokens/recent - Get recently created tokens
router.get('/recent', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const tokens = await Token.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('liquidityEventsCount')
      .populate('transactionsCount');

    res.json({ data: tokens });
  } catch (error) {
    console.error('Error fetching recent tokens:', error);
    res.status(500).json({ error: 'Failed to fetch recent tokens' });
  }
});

// GET /api/tokens/address/:address - Get token by address
router.get('/address/:address', [
  param('address').custom(validateAddress).withMessage('Invalid token address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address } = req.params;
    
    const token = await Token.findOne({ address: address.toLowerCase() })
      .populate('liquidityEventsCount')
      .populate('transactionsCount')
      .populate('holdersCount');

    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    res.json({ data: token });
  } catch (error) {
    console.error('Error fetching token:', error);
    res.status(500).json({ error: 'Failed to fetch token' });
  }
});

// GET /api/tokens/creator/:address - Get tokens by creator
router.get('/creator/:address', [
  param('address').custom(validateAddress).withMessage('Invalid creator address'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address } = req.params;
    const { page = 1, pageSize = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [tokens, totalCount] = await Promise.all([
      Token.find({ creatorAddress: address.toLowerCase() })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('liquidityEventsCount')
        .populate('transactionsCount'),
      Token.countDocuments({ creatorAddress: address.toLowerCase() })
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
    console.error('Error fetching creator tokens:', error);
    res.status(500).json({ error: 'Failed to fetch creator tokens' });
  }
});

// POST /api/tokens - Create new token
router.post('/', [authenticateToken, ...validateTokenData], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if token already exists
    const existingToken = await Token.findOne({ address: req.body.address.toLowerCase() });
    if (existingToken) {
      return res.status(409).json({ error: 'Token already exists' });
    }

    // Create new token
    const tokenData = {
      ...req.body,
      address: req.body.address.toLowerCase(),
      creatorAddress: req.body.creatorAddress.toLowerCase()
    };

    const token = new Token(tokenData);
    await token.save();

    res.status(201).json({ data: token });
  } catch (error) {
    console.error('Error creating token:', error);
    res.status(500).json({ error: 'Failed to create token' });
  }
});

// PATCH /api/tokens/update/:address - Update token
router.patch('/update/:address', [
  authenticateToken,
  param('address').custom(validateAddress).withMessage('Invalid token address'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description too long'),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('youtube').optional().isURL().withMessage('Invalid YouTube URL'),
  body('discord').optional().isURL().withMessage('Invalid Discord URL'),
  body('twitter').optional().isURL().withMessage('Invalid Twitter URL'),
  body('telegram').optional().isURL().withMessage('Invalid Telegram URL'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateData.address;
    delete updateData.creatorAddress;
    delete updateData.chainId;
    delete updateData.deploymentTxHash;
    delete updateData.deploymentBlock;

    const token = await Token.findOneAndUpdate(
      { address: address.toLowerCase() },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    res.json({ data: token });
  } catch (error) {
    console.error('Error updating token:', error);
    res.status(500).json({ error: 'Failed to update token' });
  }
});

// GET /api/tokens/search - Search tokens
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q, page = 1, pageSize = 20 } = req.query;
    
    const searchQuery = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { symbol: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    };

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [tokens, totalCount] = await Promise.all([
      Token.find(searchQuery)
        .sort({ marketCapUSD: -1, volume24hUSD: -1 })
        .skip(skip)
        .limit(limit)
        .populate('liquidityEventsCount')
        .populate('transactionsCount'),
      Token.countDocuments(searchQuery)
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
    console.error('Error searching tokens:', error);
    res.status(500).json({ error: 'Failed to search tokens' });
  }
});

// GET /api/tokens/without-liquidity - Get tokens without liquidity
router.get('/without-liquidity', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100')
], async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [tokens, totalCount] = await Promise.all([
      Token.find({ 
        isActive: true,
        $or: [
          { totalLiquidity: '0' },
          { totalLiquidity: { $exists: false } }
        ]
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('liquidityEventsCount')
        .populate('transactionsCount'),
      Token.countDocuments({ 
        isActive: true,
        $or: [
          { totalLiquidity: '0' },
          { totalLiquidity: { $exists: false } }
        ]
      })
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
    console.error('Error fetching tokens without liquidity:', error);
    res.status(500).json({ error: 'Failed to fetch tokens without liquidity' });
  }
});

// GET /api/tokens/with-liquidity - Get tokens with liquidity
router.get('/with-liquidity', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
  query('minLiquidity').optional().isFloat({ min: 0 }).withMessage('Min liquidity must be a positive number')
], async (req, res) => {
  try {
    const { page = 1, pageSize = 20, minLiquidity = 0 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const filter = {
      isActive: true,
      totalLiquidityUSD: { $gt: minLiquidity.toString() }
    };

    const [tokens, totalCount] = await Promise.all([
      Token.find(filter)
        .sort({ totalLiquidityUSD: -1, volume24hUSD: -1 })
        .skip(skip)
        .limit(limit)
        .populate('liquidityEventsCount')
        .populate('transactionsCount'),
      Token.countDocuments(filter)
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
    console.error('Error fetching tokens with liquidity:', error);
    res.status(500).json({ error: 'Failed to fetch tokens with liquidity' });
  }
});

// GET /api/tokens/count - Get total token count
router.get('/count', async (req, res) => {
  try {
    const totalCount = await Token.countDocuments({ isActive: true });
    res.json({ totalCount });
  } catch (error) {
    console.error('Error counting tokens:', error);
    res.status(500).json({ error: 'Failed to count tokens' });
  }
});

module.exports = router;
