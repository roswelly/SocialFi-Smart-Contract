const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware to check if user is moderator or admin
const requireModerator = (req, res, next) => {
  if (!req.user || (req.user.role !== 'moderator' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Moderator access required' });
  }
  next();
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (resourceField = 'creatorAddress') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceAddress = req.params[resourceField] || req.body[resourceField];
    if (!resourceAddress) {
      return res.status(400).json({ error: 'Resource identifier required' });
    }

    const userHasWallet = req.user.walletAddresses.some(
      wallet => wallet.address.toLowerCase() === resourceAddress.toLowerCase()
    );

    if (!userHasWallet) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};

// Middleware to verify wallet ownership
const verifyWalletOwnership = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Check if user has this wallet address
    const userHasWallet = req.user.walletAddresses.some(
      wallet => wallet.address.toLowerCase() === walletAddress.toLowerCase()
    );

    if (!userHasWallet) {
      return res.status(403).json({ error: 'Wallet address not associated with your account' });
    }

    next();
  } catch (error) {
    console.error('Wallet ownership verification error:', error);
    res.status(500).json({ error: 'Wallet verification failed' });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireModerator,
  requireOwnershipOrAdmin,
  verifyWalletOwnership,
  optionalAuth
};
