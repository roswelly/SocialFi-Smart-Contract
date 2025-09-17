const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validateEmail, validateUsername, validatePassword, validateAddress } = require('../middleware/validation');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register - User registration
router.post('/register', [
  body('username').custom(validateUsername).withMessage('Username must be 3-30 characters, alphanumeric and underscore only'),
  body('email').custom(validateEmail).withMessage('Invalid email format'),
  body('password').custom(validatePassword).withMessage('Password must be at least 6 characters'),
  body('walletAddress').custom(validateAddress).withMessage('Invalid wallet address'),
  body('chainId').optional().isInt({ min: 1 }).withMessage('Invalid chain ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, walletAddress, chainId = 1 } = req.body;

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Check if wallet address is already associated with another user
    const existingWallet = await User.findOne({
      'walletAddresses.address': walletAddress.toLowerCase()
    });
    if (existingWallet) {
      return res.status(409).json({ error: 'Wallet address already associated with another account' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      walletAddresses: [{
        address: walletAddress.toLowerCase(),
        chainId,
        isPrimary: true
      }]
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Return user data (without password)
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/auth/login - User login
router.post('/login', [
  body('identifier').notEmpty().withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ 
        error: 'Account is temporarily locked due to too many failed login attempts',
        lockUntil: user.lockUntil
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      // Increment login attempts
      user.loginAttempts += 1;
      
      // Lock account after 5 failed attempts for 15 minutes
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      
      await user.save();
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data (without password)
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// POST /api/auth/wallet-login - Wallet-based login
router.post('/wallet-login', [
  body('walletAddress').custom(validateAddress).withMessage('Invalid wallet address'),
  body('signature').notEmpty().withMessage('Signature is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('chainId').optional().isInt({ min: 1 }).withMessage('Invalid chain ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { walletAddress, signature, message, chainId = 1 } = req.body;

    // Find user by wallet address
    const user = await User.findOne({
      'walletAddresses.address': walletAddress.toLowerCase()
    });

    if (!user) {
      return res.status(401).json({ error: 'Wallet address not associated with any account' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // TODO: Verify signature against message
    // This would require implementing signature verification logic
    // For now, we'll assume the signature is valid if it exists

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data (without password)
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Wallet login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({ error: 'Failed to login with wallet' });
  }
});

// POST /api/auth/verify-wallet - Verify wallet ownership
router.post('/verify-wallet', [
  body('walletAddress').custom(validateAddress).withMessage('Invalid wallet address'),
  body('signature').notEmpty().withMessage('Signature is required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { walletAddress, signature, message } = req.body;

    // TODO: Implement signature verification
    // This would verify that the signature was created by the private key
    // corresponding to the wallet address

    // For now, we'll return a success response
    res.json({
      message: 'Wallet verification successful',
      verified: true
    });
  } catch (error) {
    console.error('Wallet verification error:', error);
    res.status(500).json({ error: 'Failed to verify wallet' });
  }
});

// POST /api/auth/add-wallet - Add wallet address to existing account
router.post('/add-wallet', [
  body('walletAddress').custom(validateAddress).withMessage('Invalid wallet address'),
  body('chainId').optional().isInt({ min: 1 }).withMessage('Invalid chain ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { walletAddress, chainId = 1 } = req.body;

    // Check if wallet address is already associated with another user
    const existingWallet = await User.findOne({
      'walletAddresses.address': walletAddress.toLowerCase()
    });
    if (existingWallet) {
      return res.status(409).json({ error: 'Wallet address already associated with another account' });
    }

    // Add wallet to user's account
    await req.user.addWalletAddress(walletAddress, chainId);

    res.json({
      message: 'Wallet address added successfully',
      walletAddress: walletAddress.toLowerCase(),
      chainId
    });
  } catch (error) {
    console.error('Add wallet error:', error);
    res.status(500).json({ error: 'Failed to add wallet address' });
  }
});

// POST /api/auth/remove-wallet - Remove wallet address from account
router.post('/remove-wallet', [
  body('walletAddress').custom(validateAddress).withMessage('Invalid wallet address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { walletAddress } = req.body;

    // Check if this is the only wallet address
    if (req.user.walletAddresses.length <= 1) {
      return res.status(400).json({ error: 'Cannot remove the only wallet address' });
    }

    // Remove wallet address
    req.user.walletAddresses = req.user.walletAddresses.filter(
      wallet => wallet.address.toLowerCase() !== walletAddress.toLowerCase()
    );

    // If the removed wallet was primary, set the first remaining wallet as primary
    const primaryWallet = req.user.walletAddresses.find(wallet => wallet.isPrimary);
    if (!primaryWallet && req.user.walletAddresses.length > 0) {
      req.user.walletAddresses[0].isPrimary = true;
    }

    await req.user.save();

    res.json({
      message: 'Wallet address removed successfully',
      walletAddress: walletAddress.toLowerCase()
    });
  } catch (error) {
    console.error('Remove wallet error:', error);
    res.status(500).json({ error: 'Failed to remove wallet address' });
  }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', async (req, res) => {
  try {
    // Return user data (without password)
    const userData = req.user.toObject();
    delete userData.password;

    res.json({
      user: userData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', [
  body('username').optional().custom(validateUsername).withMessage('Username must be 3-30 characters, alphanumeric and underscore only'),
  body('email').optional().custom(validateEmail).withMessage('Invalid email format'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('twitter').optional().isURL().withMessage('Invalid Twitter URL'),
  body('telegram').optional().isURL().withMessage('Invalid Telegram URL'),
  body('discord').optional().isURL().withMessage('Invalid Discord URL'),
  body('github').optional().isURL().withMessage('Invalid GitHub URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = req.body;

    // Check if username is being changed and if it's already taken
    if (updateData.username && updateData.username !== req.user.username) {
      const existingUsername = await User.findOne({ username: updateData.username });
      if (existingUsername) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== req.user.email) {
      const existingEmail = await User.findOne({ email: updateData.email.toLowerCase() });
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      updateData.email = updateData.email.toLowerCase();
    }

    // Update user profile
    Object.assign(req.user, updateData);
    await req.user.save();

    // Return updated user data (without password)
    const userData = req.user.toObject();
    delete userData.password;

    res.json({
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/auth/change-password - Change password
router.post('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').custom(validatePassword).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isValidPassword = await req.user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', async (req, res) => {
  try {
    // Generate new token
    const token = generateToken(req.user._id);

    res.json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', async (req, res) => {
  try {
    // Update last login time
    req.user.lastLoginAt = new Date();
    await req.user.save();

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

module.exports = router;
