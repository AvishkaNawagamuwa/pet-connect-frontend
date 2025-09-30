# PetConnect Backend Controllers

## Authentication Controller (controllers/authController.js)

```javascript
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, role, phone, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'owner',
      phone,
      location: location || { type: 'Point', coordinates: [0, 0] }
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        location: user.location,
        joinedAt: user.joinedAt
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        location: user.location,
        pets: user.pets,
        preferences: user.preferences,
        lastActive: user.lastActive
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('pets');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
        pets: user.pets,
        preferences: user.preferences,
        isVerified: user.isVerified,
        joinedAt: user.joinedAt,
        lastActive: user.lastActive
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user data'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const allowedUpdates = ['name', 'phone', 'location', 'preferences', 'avatar'];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Add pet to user profile
// @route   POST /api/auth/pets
// @access  Private
const addPet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.pets.push(req.body);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Pet added successfully',
      pet: user.pets[user.pets.length - 1]
    });

  } catch (error) {
    console.error('Add pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding pet'
    });
  }
};

// @desc    Update pet
// @route   PUT /api/auth/pets/:petId
// @access  Private
const updatePet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const pet = user.pets.id(req.params.petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    Object.assign(pet, req.body);
    await user.save();

    res.json({
      success: true,
      message: 'Pet updated successfully',
      pet
    });

  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating pet'
    });
  }
};

// @desc    Delete pet
// @route   DELETE /api/auth/pets/:petId
// @access  Private
const deletePet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.pets.id(req.params.petId).remove();
    await user.save();

    res.json({
      success: true,
      message: 'Pet deleted successfully'
    });

  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting pet'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  addPet,
  updatePet,
  deletePet,
  changePassword
};
```

## Post Controller (controllers/postController.js)

```javascript
const Post = require('../models/Post');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const postData = {
      ...req.body,
      userId: req.user.id
    };

    const post = await Post.create(postData);
    await post.populate('userId', 'name avatar location');

    // Emit real-time notification for urgent posts
    if (post.isUrgent && ['help', 'lost'].includes(post.type)) {
      const io = req.app.get('io');
      
      // Find nearby users for location-based notifications
      if (post.location && post.location.coordinates) {
        const nearbyUsers = await User.find({
          location: {
            $geoNear: {
              $geometry: post.location,
              $maxDistance: 10000, // 10km radius
              $spherical: true
            }
          },
          _id: { $ne: req.user.id }
        }).select('_id name');

        nearbyUsers.forEach(user => {
          io.to(user._id.toString()).emit('urgentPostAlert', {
            postId: post._id,
            type: post.type,
            title: post.title,
            location: post.location.address,
            distance: 'nearby'
          });
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating post'
    });
  }
};

// @desc    Get all posts with filters
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const {
      type,
      category,
      status,
      lat,
      lng,
      radius,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = { status: 'active' };

    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;

    // Location-based filtering
    if (lat && lng) {
      const radiusInMeters = radius ? parseInt(radius) * 1000 : 10000; // Default 10km
      query.location = {
        $geoNear: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInMeters,
          $spherical: true
        }
      };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    let posts;
    if (lat && lng) {
      // Use aggregation for geospatial queries
      posts = await Post.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            distanceField: 'distance',
            maxDistance: parseInt(radius) * 1000 || 10000,
            spherical: true,
            query: { ...query, location: undefined }
          }
        },
        { $skip: skip },
        { $limit: parseInt(limit) },
        { $sort: { createdAt: -1 } }
      ]);

      // Populate user data
      await Post.populate(posts, {
        path: 'userId',
        select: 'name avatar'
      });
    } else {
      posts = await Post.find(query)
        .populate('userId', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
    }

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      count: posts.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      posts
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching posts'
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'name avatar phone location')
      .populate('comments.userId', 'name avatar')
      .populate('responses.userId', 'name avatar phone');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      post
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching post'
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name avatar');

    res.json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    });

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating post'
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting post'
    });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingLike = post.likes.find(
      like => like.userId.toString() === req.user.id
    );

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(
        like => like.userId.toString() !== req.user.id
      );
    } else {
      // Like
      post.likes.push({ userId: req.user.id });
    }

    await post.save();

    res.json({
      success: true,
      message: existingLike ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length
    });

  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing like'
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private  
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = {
      userId: req.user.id,
      text: text.trim()
    };

    post.comments.push(comment);
    await post.save();

    await post.populate('comments.userId', 'name avatar');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
};

// @desc    Respond to help/lost pet post
// @route   POST /api/posts/:id/respond
// @access  Private
const respondToPost = async (req, res) => {
  try {
    const { message } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if this is a help or lost pet post
    if (!['help', 'lost'].includes(post.type)) {
      return res.status(400).json({
        success: false,
        message: 'Can only respond to help or lost pet posts'
      });
    }

    // Check if user already responded
    const existingResponse = post.responses.find(
      response => response.userId.toString() === req.user.id
    );

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: 'You have already responded to this post'
      });
    }

    const response = {
      userId: req.user.id,
      message: message || `I can help with this ${post.type} pet situation.`
    };

    post.responses.push(response);
    await post.save();

    await post.populate('responses.userId', 'name avatar phone');

    // Notify post owner
    const io = req.app.get('io');
    io.to(post.userId.toString()).emit('newResponse', {
      postId: post._id,
      postTitle: post.title,
      responderId: req.user.id,
      responderName: req.user.name,
      message: response.message
    });

    const newResponse = post.responses[post.responses.length - 1];

    res.status(201).json({
      success: true,
      message: 'Response sent successfully',
      response: newResponse
    });

  } catch (error) {
    console.error('Respond to post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending response'
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  respondToPost
};
```

## Chat Controller (controllers/chatController.js)

```javascript
const Chat = require('../models/Chat');
const User = require('../models/User');
const OpenAI = require('openai');
const { validationResult } = require('express-validator');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Emergency keywords detection
const emergencyKeywords = [
  'emergency', 'urgent', 'dying', 'blood', 'bleeding', 'seizure', 'choking',
  'poisoned', 'toxic', 'can\'t breathe', 'unconscious', 'severe pain',
  'hit by car', 'attacked', 'broken bone', 'bloated', 'pale gums',
  'not breathing', 'collapsed', 'vomiting blood', 'can\'t walk'
];

// System prompt for pet care AI
const SYSTEM_PROMPT = `You are Dr. PawCare, an expert AI veterinary assistant specializing in pet health, behavior, and welfare. You provide helpful, accurate, and compassionate advice to pet owners.

GUIDELINES:
- Provide practical, actionable advice for pet owners
- Always recommend consulting a veterinarian for serious health issues
- Keep responses concise (under 200 words) but informative
- Ask clarifying questions when needed (pet type, age, symptoms, duration)
- Cover topics: health symptoms, nutrition, training, behavior, grooming, exercise
- Include safety warnings for potentially dangerous situations
- Be empathetic and supportive to worried pet owners

EMERGENCY INDICATORS - Always recommend immediate vet care for:
- Difficulty breathing, choking, or severe injuries
- Seizures, loss of consciousness, or severe lethargy
- Ingestion of toxic substances
- Severe vomiting/diarrhea with blood
- Signs of severe pain or distress
- Bloated abdomen (especially in dogs)
- Pale or blue gums
- Severe trauma or accidents

RESPONSE FORMAT:
- Start with acknowledgment of concern
- Provide practical advice or information
- Include when to seek professional help
- End with supportive encouragement

If the question is not pet-related, politely redirect to pet care topics.`;

// @desc    Handle AI chat
// @route   POST /api/chat
// @access  Private
const handleChat = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Check for emergency keywords
    const isEmergency = emergencyKeywords.some(keyword =>
      message.toLowerCase().includes(keyword)
    );

    if (isEmergency) {
      const emergencyResponse = {
        content: "🚨 This sounds like a potential emergency! Please contact your nearest veterinary clinic or emergency animal hospital immediately. If it's after hours, search for '24-hour emergency vet near me' or call an emergency vet hotline. Your pet's safety is the top priority. Don't wait - seek professional help right away!",
        isEmergency: true
      };

      // Save emergency interaction
      await saveChatMessage(userId, sessionId, message, emergencyResponse.content, true);

      return res.json({
        success: true,
        reply: emergencyResponse.content,
        isEmergency: true,
        sessionId: sessionId || new Date().getTime().toString()
      });
    }

    // Get or create chat session
    let chat = await Chat.findOne({
      userId,
      sessionId: sessionId || { $exists: false },
      isActive: true
    });

    if (!chat && sessionId) {
      chat = await Chat.findOne({ userId, sessionId });
    }

    if (!chat) {
      chat = new Chat({
        userId,
        sessionId: sessionId || new Date().getTime().toString(),
        messages: []
      });
    }

    // Get user's pet information for context
    const user = await User.findById(userId).select('pets name');
    const activePets = user?.pets?.filter(pet => pet.isActive) || [];

    // Build context with pet information
    let contextPrompt = SYSTEM_PROMPT;
    if (activePets.length > 0) {
      const petContext = activePets.map(pet =>
        `${pet.name} (${pet.type}${pet.breed ? `, ${pet.breed}` : ''}${pet.age ? `, ${pet.age} years old` : ''})`
      ).join('; ');
      contextPrompt += `\n\nUser's Pets: ${petContext}`;
    }

    // Prepare chat history for OpenAI
    const chatHistory = [
      { role: 'system', content: contextPrompt },
      ...chat.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: chatHistory,
      max_tokens: 300,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const aiResponse = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;

    // Save messages to chat
    chat.messages.push(
      { role: 'user', content: message, timestamp: new Date() },
      {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        tokens: tokensUsed
      }
    );

    // Update metadata
    chat.metadata.totalTokens += tokensUsed;
    chat.lastActivity = new Date();

    await chat.save();

    res.json({
      success: true,
      reply: aiResponse,
      sessionId: chat.sessionId,
      tokens: tokensUsed
    });

  } catch (error) {
    console.error('Chat error:', error);

    // Provide fallback response
    let fallbackMessage = "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";

    if (error.code === 'insufficient_quota') {
      fallbackMessage = "Our AI service is temporarily unavailable due to high demand. Please try again later or consult your veterinarian for urgent concerns.";
    } else if (error.code === 'rate_limit_exceeded') {
      fallbackMessage = "Too many requests at the moment. Please wait a few seconds and try again.";
    }

    res.status(500).json({
      success: false,
      message: fallbackMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, limit = 50 } = req.query;

    const query = { userId, isActive: true };
    if (sessionId) query.sessionId = sessionId;

    const chats = await Chat.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .select('sessionId messages metadata createdAt updatedAt');

    res.json({
      success: true,
      count: chats.length,
      chats
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching chat history'
    });
  }
};

// @desc    Get specific chat session
// @route   GET /api/chat/session/:sessionId
// @access  Private
const getChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({ userId, sessionId, isActive: true });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      chat
    });

  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching chat session'
    });
  }
};

// @desc    Clear chat session
// @route   DELETE /api/chat/session/:sessionId
// @access  Private
const clearChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const result = await Chat.findOneAndUpdate(
      { userId, sessionId },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat session cleared successfully'
    });

  } catch (error) {
    console.error('Clear chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing chat session'
    });
  }
};

// @desc    Rate chat response
// @route   POST /api/chat/rate
// @access  Private
const rateChatResponse = async (req, res) => {
  try {
    const { sessionId, rating } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const chat = await Chat.findOne({ userId, sessionId, isActive: true });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    chat.metadata.userSatisfaction = rating;
    await chat.save();

    res.json({
      success: true,
      message: 'Thank you for your feedback!'
    });

  } catch (error) {
    console.error('Rate chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saving rating'
    });
  }
};

// Helper function to save chat interactions
const saveChatMessage = async (userId, sessionId, userMessage, aiResponse, isEmergency = false) => {
  try {
    let chat = await Chat.findOne({ userId, sessionId, isActive: true });

    if (!chat) {
      chat = new Chat({
        userId,
        sessionId: sessionId || new Date().getTime().toString(),
        messages: []
      });
    }

    chat.messages.push(
      { role: 'user', content: userMessage, timestamp: new Date() },
      {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        metadata: { isEmergency }
      }
    );

    if (isEmergency) {
      chat.emergencyFlags += 1;
    }

    await chat.save();
    return chat;

  } catch (error) {
    console.error('Save chat message error:', error);
  }
};

module.exports = {
  handleChat,
  getChatHistory,
  getChatSession,
  clearChatSession,
  rateChatResponse
};
```

This completes the main controllers for the PetConnect backend. Each controller includes:

1. **Authentication Controller**: Complete user management with registration, login, profile updates, and pet management
2. **Post Controller**: Full CRUD operations for posts with geospatial queries, likes, comments, and responses
3. **Chat Controller**: AI-powered chat with emergency detection, context awareness, and session management

All controllers include proper error handling, validation, and real-time features using Socket.io. The next section would include the routes and middleware files.