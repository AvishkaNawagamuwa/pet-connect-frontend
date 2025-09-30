# PetConnect Backend Routes & Middleware

## Route Files

### Authentication Routes (routes/auth.js)

```javascript
const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  addPet,
  updatePet,
  deletePet,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['owner', 'veterinarian', 'shelter'])
    .withMessage('Role must be owner, veterinarian, or shelter')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('location.address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address cannot be empty'),
  body('preferences.notifications')
    .optional()
    .isBoolean()
    .withMessage('Notifications preference must be boolean'),
  body('preferences.emailUpdates')
    .optional()
    .isBoolean()
    .withMessage('Email updates preference must be boolean')
];

const petValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Pet name must be between 1 and 30 characters'),
  body('type')
    .isIn(['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'guinea pig', 'reptile', 'other'])
    .withMessage('Invalid pet type'),
  body('breed')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Breed must be less than 50 characters'),
  body('age')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Age must be between 0 and 50'),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'unknown'])
    .withMessage('Gender must be male, female, or unknown'),
  body('isSpayedNeutered')
    .optional()
    .isBoolean()
    .withMessage('Spayed/neutered status must be boolean')
];

const passwordChangeValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/me', getMe);
router.put('/me', updateProfileValidation, updateProfile);
router.put('/password', passwordChangeValidation, changePassword);

// Pet management routes
router.post('/pets', petValidation, addPet);
router.put('/pets/:petId', petValidation, updatePet);
router.delete('/pets/:petId', deletePet);

module.exports = router;
```

### Post Routes (routes/posts.js)

```javascript
const express = require('express');
const { body, query } = require('express-validator');
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  respondToPost
} = require('../controllers/postController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Validation rules
const postValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('type')
    .isIn(['lost', 'found', 'adoption', 'help', 'general'])
    .withMessage('Invalid post type'),
  body('category')
    .isIn(['dogs', 'cats', 'birds', 'small-pets', 'reptiles', 'other'])
    .withMessage('Invalid category'),
  body('petDetails.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Pet name must be between 1 and 30 characters'),
  body('petDetails.age')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Pet age must be between 0 and 50'),
  body('petDetails.breed')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Breed must be less than 50 characters'),
  body('petDetails.color')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Color must be less than 50 characters'),
  body('petDetails.size')
    .optional()
    .isIn(['small', 'medium', 'large', 'extra-large'])
    .withMessage('Invalid pet size'),
  body('petDetails.gender')
    .optional()
    .isIn(['male', 'female', 'unknown'])
    .withMessage('Invalid pet gender'),
  body('location.address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address cannot be empty'),
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),
  body('isUrgent')
    .optional()
    .isBoolean()
    .withMessage('Urgent status must be boolean'),
  body('contactInfo.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('contactInfo.preferredMethod')
    .optional()
    .isIn(['phone', 'email', 'app'])
    .withMessage('Invalid preferred contact method')
];

const queryValidation = [
  query('type')
    .optional()
    .isIn(['lost', 'found', 'adoption', 'help', 'general'])
    .withMessage('Invalid post type'),
  query('category')
    .optional()
    .isIn(['dogs', 'cats', 'birds', 'small-pets', 'reptiles', 'other'])
    .withMessage('Invalid category'),
  query('status')
    .optional()
    .isIn(['active', 'resolved', 'archived'])
    .withMessage('Invalid status'),
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Radius must be between 1 and 100 km'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
];

const commentValidation = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
];

const responseValidation = [
  body('message')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Response message must be between 10 and 500 characters')
];

// Public routes
router.get('/', queryValidation, getPosts);
router.get('/:id', getPost);

// Protected routes
router.use(protect);

router.post('/', upload.array('images', 5), postValidation, createPost);
router.put('/:id', upload.array('images', 5), postValidation, updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.post('/:id/comments', commentValidation, addComment);
router.post('/:id/respond', responseValidation, respondToPost);

module.exports = router;
```

### Chat Routes (routes/chat.js)

```javascript
const express = require('express');
const { body, query } = require('express-validator');
const {
  handleChat,
  getChatHistory,
  getChatSession,
  clearChatSession,
  rateChatResponse
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Rate limiting for chat requests
const chatRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each user to 30 requests per windowMs
  message: {
    success: false,
    message: 'Too many chat requests. Please wait a moment before sending another message.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation rules
const chatValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('sessionId')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Session ID must be between 1 and 100 characters')
];

const historyValidation = [
  query('sessionId')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Session ID must be between 1 and 100 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const ratingValidation = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
];

// All chat routes require authentication
router.use(protect);

// Chat routes
router.post('/', chatRateLimit, chatValidation, handleChat);
router.get('/history', historyValidation, getChatHistory);
router.get('/session/:sessionId', getChatSession);
router.delete('/session/:sessionId', clearChatSession);
router.post('/rate', ratingValidation, rateChatResponse);

module.exports = router;
```

### News Routes (routes/news.js)

```javascript
const express = require('express');
const { body, query } = require('express-validator');
const News = require('../models/News');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Validation rules
const newsValidation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('summary')
    .trim()
    .isLength({ min: 50, max: 500 })
    .withMessage('Summary must be between 50 and 500 characters'),
  body('content')
    .trim()
    .isLength({ min: 100, max: 10000 })
    .withMessage('Content must be between 100 and 10000 characters'),
  body('category')
    .isIn(['health', 'nutrition', 'training', 'news', 'tips', 'research'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('Published status must be boolean'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Featured status must be boolean')
];

const queryValidation = [
  query('category')
    .optional()
    .isIn(['health', 'nutrition', 'training', 'news', 'tips', 'research'])
    .withMessage('Invalid category'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a string'),
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured filter must be boolean'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'title', '-title', 'views', '-views'])
    .withMessage('Invalid sort parameter')
];

// @desc    Get all news articles
// @route   GET /api/news
// @access  Public
const getNews = async (req, res) => {
  try {
    const {
      category,
      search,
      tags,
      featured,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = { isPublished: true };

    if (category) query.category = category;
    if (featured !== undefined) query.isFeatured = featured === 'true';
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const news = await News.find(query)
      .populate('author', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content'); // Exclude full content for list view

    // Get total count
    const total = await News.countDocuments(query);

    res.json({
      success: true,
      count: news.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      news
    });

  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching news'
    });
  }
};

// @desc    Get single news article
// @route   GET /api/news/:id
// @access  Public
const getNewsArticle = async (req, res) => {
  try {
    const article = await News.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('likes.userId', 'name')
      .populate('comments.userId', 'name avatar');

    if (!article || !article.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    res.json({
      success: true,
      article
    });

  } catch (error) {
    console.error('Get news article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching article'
    });
  }
};

// @desc    Like/Unlike news article
// @route   POST /api/news/:id/like
// @access  Private
const likeNews = async (req, res) => {
  try {
    const article = await News.findById(req.params.id);

    if (!article || !article.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const existingLike = article.likes.find(
      like => like.userId.toString() === req.user.id
    );

    if (existingLike) {
      // Unlike
      article.likes = article.likes.filter(
        like => like.userId.toString() !== req.user.id
      );
    } else {
      // Like
      article.likes.push({ userId: req.user.id });
    }

    await article.save();

    res.json({
      success: true,
      message: existingLike ? 'Article unliked' : 'Article liked',
      likesCount: article.likes.length
    });

  } catch (error) {
    console.error('Like news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing like'
    });
  }
};

// @desc    Add comment to news article
// @route   POST /api/news/:id/comments
// @access  Private
const addNewsComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const article = await News.findById(req.params.id);

    if (!article || !article.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const comment = {
      userId: req.user.id,
      text: text.trim()
    };

    article.comments.push(comment);
    await article.save();

    await article.populate('comments.userId', 'name avatar');

    const newComment = article.comments[article.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });

  } catch (error) {
    console.error('Add news comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
};

// Public routes
router.get('/', queryValidation, getNews);
router.get('/:id', getNewsArticle);

// Protected routes
router.use(protect);
router.post('/:id/like', likeNews);
router.post('/:id/comments', [
  body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters')
], addNewsComment);

module.exports = router;
```

## Middleware Files

### Authentication Middleware (middleware/auth.js)

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not found.'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Account is deactivated.'
        });
      }

      // Update last active timestamp
      user.lastActive = new Date();
      await user.save();

      // Add user to request
      req.user = user;
      next();

    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Optional authentication - user can be authenticated or not
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but continue without user
        console.log('Optional auth - invalid token:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth
};
```

### File Upload Middleware (middleware/upload.js)

```javascript
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on file type and route
    let folder = 'petconnect/general';
    
    if (req.route.path.includes('posts')) {
      folder = 'petconnect/posts';
    } else if (req.route.path.includes('news')) {
      folder = 'petconnect/news';
    } else if (req.route.path.includes('profile') || req.route.path.includes('avatar')) {
      folder = 'petconnect/profiles';
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    
    return {
      folder: folder,
      public_id: `${file.fieldname}-${uniqueSuffix}`,
      format: fileExtension.substring(1), // Remove the dot from extension
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WebP)'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files per upload.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }

  if (error.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

// Helper function to delete uploaded files from Cloudinary
const deleteFromCloudinary = async (publicIds) => {
  try {
    if (!Array.isArray(publicIds)) {
      publicIds = [publicIds];
    }

    const deletePromises = publicIds.map(publicId => 
      cloudinary.uploader.destroy(publicId)
    );

    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  upload,
  handleUploadError,
  deleteFromCloudinary,
  cloudinary
};
```

### Error Handling Middleware (middleware/errorHandler.js)

```javascript
const mongoose = require('mongoose');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle Mongoose cast errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handle Mongoose duplicate field errors
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
  return new AppError(message, 400);
};

// Handle Mongoose validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again', 401);
};

// Send error in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Send error in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥:', err);

    res.status(500).json({
      success: false,
      message: 'Something went wrong!'
    });
  }
};

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// Handle async errors
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  AppError,
  errorHandler,
  catchAsync,
  notFound
};
```

### Rate Limiting Middleware (middleware/rateLimiter.js)

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Create Redis client for rate limiting (optional)
let redisClient;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
}

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }) : undefined
});

// Auth rate limiter (more strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }) : undefined
});

// Chat rate limiter
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each user to 30 chat requests per minute
  message: {
    success: false,
    message: 'Too many chat requests. Please wait a moment before sending another message.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user ? req.user.id : req.ip;
  },
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }) : undefined
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit each user to 20 uploads per 10 minutes
  message: {
    success: false,
    message: 'Too many file uploads. Please wait before uploading more files.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  },
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }) : undefined
});

module.exports = {
  generalLimiter,
  authLimiter,
  chatLimiter,
  uploadLimiter
};
```

This completes the comprehensive routes and middleware system for the PetConnect backend. The routes provide full CRUD operations with proper validation, authentication, and authorization, while the middleware handles security, file uploads, error handling, and rate limiting.