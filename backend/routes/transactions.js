const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Token = require('../models/Token');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateAddress, validateTxHash, validateAmount } = require('../middleware/validation');

const router = express.Router();

// GET /api/transactions - Get all transactions with pagination and filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
  query('tokenAddress').optional().custom(validateAddress).withMessage('Invalid token address'),
  query('type').optional().isIn(['buy', 'sell', 'add_liquidity', 'remove_liquidity', 'transfer', 'mint', 'burn']).withMessage('Invalid transaction type'),
  query('senderAddress').optional().custom(validateAddress).withMessage('Invalid sender address'),
  query('recipientAddress').optional().custom(validateAddress).withMessage('Invalid recipient address'),
  query('chainId').optional().isInt({ min: 1 }).withMessage('Invalid chain ID'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('sortBy').optional().isIn(['blockTimestamp', 'blockNumber', 'ethAmount', 'tokenAmount', 'tokenPrice']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      pageSize = 20,
      tokenAddress,
      type,
      senderAddress,
      recipientAddress,
      chainId,
      startDate,
      endDate,
      sortBy = 'blockTimestamp',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (tokenAddress) filter.tokenAddress = tokenAddress.toLowerCase();
    if (type) filter.type = type;
    if (senderAddress) filter.senderAddress = senderAddress.toLowerCase();
    if (recipientAddress) filter.recipientAddress = recipientAddress.toLowerCase();
    if (chainId) filter.chainId = parseInt(chainId);
    if (startDate || endDate) {
      filter.blockTimestamp = {};
      if (startDate) filter.blockTimestamp.$gte = new Date(startDate);
      if (endDate) filter.blockTimestamp.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('tokenId', 'name symbol logo'),
      Transaction.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      transactions: transactions,
      totalCount,
      currentPage: parseInt(page),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /api/transactions/recent - Get recent transactions
router.get('/recent', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('chainId').optional().isInt({ min: 1 }).withMessage('Invalid chain ID')
], async (req, res) => {
  try {
    const { limit = 50, chainId } = req.query;
    
    const filter = { status: 'confirmed' };
    if (chainId) filter.chainId = parseInt(chainId);

    const transactions = await Transaction.find(filter)
      .sort({ blockTimestamp: -1 })
      .limit(parseInt(limit))
      .populate('tokenId', 'name symbol logo');

    res.json({ data: transactions });
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    res.status(500).json({ error: 'Failed to fetch recent transactions' });
  }
});

// GET /api/transactions/token/:address - Get transactions for a specific token
router.get('/token/:address', [
  param('address').custom(validateAddress).withMessage('Invalid token address'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
  query('type').optional().isIn(['buy', 'sell', 'add_liquidity', 'remove_liquidity', 'transfer', 'mint', 'burn']).withMessage('Invalid transaction type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address } = req.params;
    const { page = 1, pageSize = 20, type } = req.query;
    
    const filter = { tokenAddress: address.toLowerCase() };
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .sort({ blockTimestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('tokenId', 'name symbol logo'),
      Transaction.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: transactions,
      totalCount,
      currentPage: parseInt(page),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    res.status(500).json({ error: 'Failed to fetch token transactions' });
  }
});

// GET /api/transactions/address/:address - Get transactions for a specific address
router.get('/address/:address', [
  param('address').custom(validateAddress).withMessage('Invalid address'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
  query('type').optional().isIn(['buy', 'sell', 'add_liquidity', 'remove_liquidity', 'transfer', 'mint', 'burn']).withMessage('Invalid transaction type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address } = req.params;
    const { page = 1, pageSize = 20, type } = req.query;
    
    const filter = {
      $or: [
        { senderAddress: address.toLowerCase() },
        { recipientAddress: address.toLowerCase() }
      ]
    };
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .sort({ blockTimestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('tokenId', 'name symbol logo'),
      Transaction.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: transactions,
      totalCount,
      currentPage: parseInt(page),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching address transactions:', error);
    res.status(500).json({ error: 'Failed to fetch address transactions' });
  }
});

// POST /api/transactions - Create new transaction
router.post('/', [
  authenticateToken,
  body('txHash').custom(validateTxHash).withMessage('Invalid transaction hash'),
  body('tokenAddress').custom(validateAddress).withMessage('Invalid token address'),
  body('type').isIn(['buy', 'sell', 'add_liquidity', 'remove_liquidity', 'transfer', 'mint', 'burn']).withMessage('Invalid transaction type'),
  body('senderAddress').custom(validateAddress).withMessage('Invalid sender address'),
  body('recipientAddress').custom(validateAddress).withMessage('Invalid recipient address'),
  body('ethAmount').custom(validateAmount).withMessage('Invalid ETH amount'),
  body('tokenAmount').custom(validateAmount).withMessage('Invalid token amount'),
  body('tokenPrice').custom(validateAmount).withMessage('Invalid token price'),
  body('blockNumber').isInt({ min: 1 }).withMessage('Invalid block number'),
  body('blockTimestamp').isISO8601().withMessage('Invalid block timestamp'),
  body('chainId').isInt({ min: 1 }).withMessage('Invalid chain ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if transaction already exists
    const existingTransaction = await Transaction.findOne({ txHash: req.body.txHash });
    if (existingTransaction) {
      return res.status(409).json({ error: 'Transaction already exists' });
    }

    // Check if token exists
    const token = await Token.findOne({ address: req.body.tokenAddress.toLowerCase() });
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    // Create new transaction
    const transactionData = {
      ...req.body,
      tokenId: token._id,
      tokenAddress: req.body.tokenAddress.toLowerCase(),
      senderAddress: req.body.senderAddress.toLowerCase(),
      recipientAddress: req.body.recipientAddress.toLowerCase(),
      blockTimestamp: new Date(req.body.blockTimestamp)
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    // Update token's latest transaction timestamp
    await Token.findByIdAndUpdate(token._id, {
      latestTransactionTimestamp: transaction.blockTimestamp
    });

    res.status(201).json({ data: transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// GET /api/transactions/hash/:txHash - Get transaction by hash
router.get('/hash/:txHash', [
  param('txHash').custom(validateTxHash).withMessage('Invalid transaction hash')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { txHash } = req.params;
    
    const transaction = await Transaction.findOne({ txHash: txHash.toLowerCase() })
      .populate('tokenId', 'name symbol logo');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ data: transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// GET /api/transactions/volume-range - Get volume range for analytics
router.get('/volume-range', [
  query('startDate').isISO8601().withMessage('Start date is required'),
  query('endDate').isISO8601().withMessage('End date is required'),
  query('chainId').optional().isInt({ min: 1 }).withMessage('Invalid chain ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate, chainId } = req.query;
    
    const filter = {
      blockTimestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: 'confirmed'
    };
    if (chainId) filter.chainId = parseInt(chainId);

    const transactions = await Transaction.find(filter)
      .select('ethAmount tokenAmount tokenPrice blockTimestamp type')
      .sort({ blockTimestamp: 1 });

    // Calculate volume metrics
    const volumeData = transactions.reduce((acc, tx) => {
      const date = tx.blockTimestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          totalVolume: 0,
          totalVolumeUSD: 0,
          transactionCount: 0
        };
      }
      
      acc[date].totalVolume += parseFloat(tx.ethAmount || 0);
      acc[date].totalVolumeUSD += parseFloat(tx.tokenPrice || 0) * parseFloat(tx.tokenAmount || 0);
      acc[date].transactionCount += 1;
      
      return acc;
    }, {});

    const volumeArray = Object.values(volumeData);

    res.json({
      data: volumeArray,
      totalTransactions: transactions.length,
      totalVolume: volumeArray.reduce((sum, day) => sum + day.totalVolume, 0),
      totalVolumeUSD: volumeArray.reduce((sum, day) => sum + day.totalVolumeUSD, 0)
    });
  } catch (error) {
    console.error('Error fetching volume range:', error);
    res.status(500).json({ error: 'Failed to fetch volume range' });
  }
});

// GET /api/transactions/stats - Get transaction statistics
router.get('/stats', [
  query('chainId').optional().isInt({ min: 1 }).withMessage('Invalid chain ID'),
  query('period').optional().isIn(['24h', '7d', '30d', 'all']).withMessage('Invalid period')
], async (req, res) => {
  try {
    const { chainId, period = '24h' } = req.query;
    
    const filter = { status: 'confirmed' };
    if (chainId) filter.chainId = parseInt(chainId);

    // Add time filter based on period
    if (period !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (period) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
      
      if (startDate) {
        filter.blockTimestamp = { $gte: startDate };
      }
    }

    const [totalTransactions, totalVolume, typeStats] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.aggregate([
        { $match: filter },
        { $group: { _id: null, totalVolume: { $sum: { $toDouble: '$ethAmount' } } } }
      ]),
      Transaction.aggregate([
        { $match: filter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const stats = {
      totalTransactions,
      totalVolume: totalVolume[0]?.totalVolume || 0,
      typeDistribution: typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      period,
      chainId: chainId ? parseInt(chainId) : 'all'
    };

    res.json({ data: stats });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({ error: 'Failed to fetch transaction stats' });
  }
});

module.exports = router;
