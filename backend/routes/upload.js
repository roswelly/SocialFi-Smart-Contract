const express = require('express');
const multer = require('multer');
const { body, query, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// POST /api/upload/image - Upload image to Cloudinary
router.post('/image', [
  authenticateToken,
  upload.single('image'),
  body('folder').optional().isString().withMessage('Folder must be a string'),
  body('public_id').optional().isString().withMessage('Public ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { folder = 'crossfun', public_id } = req.body;

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

    // Upload to Cloudinary
    const uploadOptions = {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Resize large images
        { quality: 'auto:good' } // Optimize quality
      ]
    };

    if (public_id) {
      uploadOptions.public_id = public_id;
    }

    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    res.json({
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// POST /api/upload/logo - Upload token logo
router.post('/logo', [
  authenticateToken,
  upload.single('logo'),
  body('tokenAddress').isString().withMessage('Token address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No logo file provided' });
    }

    const { tokenAddress } = req.body;

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

    // Upload to Cloudinary with token-specific folder
    const uploadOptions = {
      folder: `crossfun/logos/${tokenAddress.toLowerCase()}`,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'center' }, // Square logo
        { quality: 'auto:good' }
      ]
    };

    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    res.json({
      message: 'Logo uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// POST /api/upload/avatar - Upload user avatar
router.post('/avatar', [
  authenticateToken,
  upload.single('avatar')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No avatar file provided' });
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

    // Upload to Cloudinary with user-specific folder
    const uploadOptions = {
      folder: `crossfun/avatars/${req.user._id}`,
      resource_type: 'image',
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' }, // Square avatar with face detection
        { quality: 'auto:good' }
      ]
    };

    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    res.json({
      message: 'Avatar uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// DELETE /api/upload/image - Delete image from Cloudinary
router.delete('/image', [
  authenticateToken,
  body('public_id').isString().withMessage('Public ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { public_id } = req.body;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      res.json({
        message: 'Image deleted successfully',
        data: { public_id }
      });
    } else {
      res.status(400).json({ error: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// GET /api/upload/transform - Get transformed image URL
router.get('/transform', [
  query('public_id').isString().withMessage('Public ID is required'),
  query('width').optional().isInt({ min: 1, max: 2000 }).withMessage('Width must be between 1 and 2000'),
  query('height').optional().isInt({ min: 1, max: 2000 }).withMessage('Height must be between 1 and 2000'),
  query('crop').optional().isIn(['fill', 'scale', 'fit', 'limit', 'thumb']).withMessage('Invalid crop mode'),
  query('quality').optional().isIn(['auto', 'auto:good', 'auto:best', 'auto:eco']).withMessage('Invalid quality setting')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { public_id, width, height, crop, quality } = req.query;

    // Build transformation options
    const transformation = [];
    if (width || height) {
      transformation.push({
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        crop: crop || 'limit'
      });
    }
    if (quality) {
      transformation.push({ quality });
    }

    // Generate transformed URL
    const transformedUrl = cloudinary.url(public_id, {
      transformation,
      secure: true
    });

    res.json({
      data: {
        url: transformedUrl,
        public_id,
        transformation: transformation.length > 0 ? transformation : undefined
      }
    });
  } catch (error) {
    console.error('Image transformation error:', error);
    res.status(500).json({ error: 'Failed to transform image' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Only one file allowed.' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ error: 'Only image files are allowed' });
  }
  
  next(error);
});

module.exports = router;
