const express = require('express');
const { query, validationResult } = require('express-validator');
const Token = require('../models/Token');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/overview - Get platform overview statistics
router.get('/overview', async (req, res) => {
  try {
    // Get basic counts
    const [totalTokens, totalUsers, totalTransactions] = await Promise.all([
      Token.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true, isBanned: false }),
      Transaction.countDocuments({ status: 'confirmed' })
    ]);

    // Get recent activity (last 24 hours)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [newTokens24h, newUsers24h, newTransactions24h] = await Promise.all([
      Token.countDocuments({ createdAt: { $gte: last24h } }),
      User.countDocuments({ createdAt: { $gte: last24h } }),
      Transaction.countDocuments({ 
        createdAt: { $gte: last24h },
        status: 'confirmed'
      })
    ]);

    // Get volume statistics
    const volumeStats = await Token.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: null,
        totalMarketCap: { $sum: { $toDouble: '$marketCapUSD' } },
        totalVolume24h: { $sum: { $toDouble: '$volume24hUSD' } },
        totalLiquidity: { $sum: { $toDouble: '$totalLiquidityUSD' } }
      }}
    ]);

    const overview = {
      totalTokens,
      totalUsers,
      totalTransactions,
      newTokens24h,
      newUsers24h,
      newTransactions24h,
      totalMarketCap: volumeStats[0]?.totalMarketCap || 0,
      totalVolume24h: volumeStats[0]?.totalVolume24h || 0,
      totalLiquidity: volumeStats[0]?.totalLiquidity || 0
    };

    res.json({ data: overview });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// GET /api/analytics/tokens - Get token analytics
router.get('/tokens', [
  query('period').optional().isIn(['24h', '7d', '30d', 'all']).withMessage('Invalid period'),
  query('chainId').optional().isInt({ min: 1 }).withMessage('Invalid chain ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = 'all', chainId } = req.query;
    
    const filter = { isActive: true };
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
        filter.createdAt = { $gte: startDate };
      }
    }

    // Get token statistics
    const [tokenStats, topTokens, newTokens] = await Promise.all([
      Token.aggregate([
        { $match: filter },
        { $group: {
          _id: null,
          totalTokens: { $sum: 1 },
          verifiedTokens: { $sum: { $cond: ['$isVerified', 1, 0] } },
          totalMarketCap: { $sum: { $toDouble: '$marketCapUSD' } },
          totalVolume24h: { $sum: { $toDouble: '$volume24hUSD' } },
          totalLiquidity: { $sum: { $toDouble: '$totalLiquidityUSD' } },
          avgPriceChange: { $avg: { $toDouble: '$priceChange24hPercent' } }
        }}
      ]),
      Token.find(filter)
        .sort({ volume24hUSD: -1 })
        .limit(10)
        .select('name symbol logo volume24hUSD priceChange24hPercent marketCapUSD'),
      Token.find(filter)
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name symbol logo createdAt marketCapUSD')
    ]);

    const analytics = {
      period,
      chainId: chainId ? parseInt(chainId) : 'all',
      stats: tokenStats[0] || {
        totalTokens: 0,
        verifiedTokens: 0,
        totalMarketCap: 0,
        totalVolume24h: 0,
        totalLiquidity: 0,
        avgPriceChange: 0
      },
      topTokens,
      newTokens
    };

    res.json({ data: analytics });
  } catch (error) {
    console.error('Error fetching token analytics:', error);
    res.status(500).json({ error: 'Failed to fetch token analytics' });
  }
});

// GET /api/analytics/transactions - Get transaction analytics
router.get('/transactions', [
  query('period').optional().isIn(['24h', '7d', '30d', 'all']).withMessage('Invalid period'),
  query('chainId').optional().isInt({ min: 1 }).withMessage('Invalid chain ID'),
  query('type').optional().isIn(['buy', 'sell', 'add_liquidity', 'remove_liquidity', 'transfer', 'mint', 'burn']).withMessage('Invalid transaction type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = 'all', chainId, type } = req.query;
    
    const filter = { status: 'confirmed' };
    if (chainId) filter.chainId = parseInt(chainId);
    if (type) filter.type = type;

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

    // Get transaction statistics
    const [txStats, typeDistribution, volumeByDay] = await Promise.all([
      Transaction.aggregate([
        { $match: filter },
        { $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalVolume: { $sum: { $toDouble: '$ethAmount' } },
          totalVolumeUSD: { $sum: { $toDouble: '$tokenPriceUSD' } },
          avgGasUsed: { $avg: { $toDouble: '$gasUsed' } },
          avgGasPrice: { $avg: { $toDouble: '$gasPrice' } }
        }}
      ]),
      Transaction.aggregate([
        { $match: filter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Transaction.aggregate([
        { $match: filter },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$blockTimestamp' } },
          count: { $sum: 1 },
          volume: { $sum: { $toDouble: '$ethAmount' } }
        }},
        { $sort: { _id: 1 } }
      ])
    ]);

    const analytics = {
      period,
      chainId: chainId ? parseInt(chainId) : 'all',
      type: type || 'all',
      stats: txStats[0] || {
        totalTransactions: 0,
        totalVolume: 0,
        totalVolumeUSD: 0,
        avgGasUsed: 0,
        avgGasPrice: 0
      },
      typeDistribution,
      volumeByDay
    };

    res.json({ data: analytics });
  } catch (error) {
    console.error('Error fetching transaction analytics:', error);
    res.status(500).json({ error: 'Failed to fetch transaction analytics' });
  }
});

// GET /api/analytics/users - Get user analytics
router.get('/users', [
  query('period').optional().isIn(['24h', '7d', '30d', 'all']).withMessage('Invalid period')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = 'all' } = req.query;
    
    const filter = { isActive: true, isBanned: false };

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
        filter.createdAt = { $gte: startDate };
      }
    }

    // Get user statistics
    const [userStats, topCreators, userGrowth] = await Promise.all([
      User.aggregate([
        { $match: filter },
        { $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
          totalTokensCreated: { $sum: '$tokensCreated' },
          avgTokensPerUser: { $avg: '$tokensCreated' }
        }}
      ]),
      User.find(filter)
        .sort({ tokensCreated: -1, totalVolumeUSD: -1 })
        .limit(10)
        .select('username avatar tokensCreated totalVolumeUSD'),
      User.aggregate([
        { $match: filter },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          newUsers: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ])
    ]);

    const analytics = {
      period,
      stats: userStats[0] || {
        totalUsers: 0,
        verifiedUsers: 0,
        totalTokensCreated: 0,
        avgTokensPerUser: 0
      },
      topCreators,
      userGrowth
    };

    res.json({ data: analytics });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// GET /api/analytics/trends - Get trending data
router.get('/trends', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get trending tokens
    const trendingTokens = await Token.find({ isActive: true })
      .sort({ volume24hUSD: -1, priceChange24hPercent: -1 })
      .limit(parseInt(limit))
      .select('name symbol logo volume24hUSD priceChange24hPercent marketCapUSD');

    // Get top gainers and losers
    const [topGainers, topLosers] = await Promise.all([
      Token.find({ isActive: true, priceChange24hPercent: { $gt: 0 } })
        .sort({ priceChange24hPercent: -1 })
        .limit(parseInt(limit))
        .select('name symbol logo priceChange24hPercent volume24hUSD'),
      Token.find({ isActive: true, priceChange24hPercent: { $lt: 0 } })
        .sort({ priceChange24hPercent: 1 })
        .limit(parseInt(limit))
        .select('name symbol logo priceChange24hPercent volume24hUSD')
    ]);

    // Get most active tokens
    const mostActive = await Token.find({ isActive: true })
      .sort({ volume24hUSD: -1 })
      .limit(parseInt(limit))
      .select('name symbol logo volume24hUSD marketCapUSD');

    const trends = {
      trendingTokens,
      topGainers,
      topLosers,
      mostActive
    };

    res.json({ data: trends });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// GET /api/analytics/chains - Get chain-specific analytics
router.get('/chains', async (req, res) => {
  try {
    // Get statistics by chain
    const chainStats = await Token.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: '$chainId',
        tokenCount: { $sum: 1 },
        totalMarketCap: { $sum: { $toDouble: '$marketCapUSD' } },
        totalVolume24h: { $sum: { $toDouble: '$volume24hUSD' } },
        totalLiquidity: { $sum: { $toDouble: '$totalLiquidityUSD' } },
        verifiedTokens: { $sum: { $cond: ['$isVerified', 1, 0] } }
      }},
      { $sort: { tokenCount: -1 } }
    ]);

    // Get transaction volume by chain
    const txVolumeByChain = await Transaction.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: {
        _id: '$chainId',
        transactionCount: { $sum: 1 },
        totalVolume: { $sum: { $toDouble: '$ethAmount' } },
        avgGasUsed: { $avg: { $toDouble: '$gasUsed' } }
      }},
      { $sort: { transactionCount: -1 } }
    ]);

    const analytics = {
      chainStats,
      txVolumeByChain
    };

    res.json({ data: analytics });
  } catch (error) {
    console.error('Error fetching chain analytics:', error);
    res.status(500).json({ error: 'Failed to fetch chain analytics' });
  }
});

// GET /api/analytics/performance - Get platform performance metrics
router.get('/performance', [
  query('startDate').isISO8601().withMessage('Start date is required'),
  query('endDate').isISO8601().withMessage('End date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get daily metrics
    const dailyMetrics = await Token.aggregate([
      { $match: { 
        isActive: true,
        createdAt: { $gte: start, $lte: end }
      }},
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        newTokens: { $sum: 1 },
        totalMarketCap: { $sum: { $toDouble: '$marketCapUSD' } },
        totalVolume: { $sum: { $toDouble: '$volume24hUSD' } }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Get user growth
    const userGrowth = await User.aggregate([
      { $match: { 
        isActive: true,
        createdAt: { $gte: start, $lte: end }
      }},
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        newUsers: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Get transaction volume
    const txVolume = await Transaction.aggregate([
      { $match: { 
        status: 'confirmed',
        blockTimestamp: { $gte: start, $lte: end }
      }},
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$blockTimestamp' } },
        transactionCount: { $sum: 1 },
        totalVolume: { $sum: { $toDouble: '$ethAmount' } }
      }},
      { $sort: { _id: 1 } }
    ]);

    const performance = {
      period: { startDate, endDate },
      dailyMetrics,
      userGrowth,
      txVolume
    };

    res.json({ data: performance });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

module.exports = router;
