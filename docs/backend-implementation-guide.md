# Pet Connect Backend - AI Chatbot Implementation Guide

This guide provides the complete backend implementation for the AI Pet Advice Chatbot feature.

## Prerequisites

```bash
npm install express mongoose openai dotenv cors helmet rate-limit
```

## Environment Variables (.env)

```env
MONGODB_URI=mongodb://localhost:27017/petconnect
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_here
PORT=3000
```

## 1. Database Models

### Chat Model (models/Chat.js)

```javascript
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sessionId: { 
    type: String, 
    default: () => new mongoose.Types.ObjectId().toString() 
  },
  messages: [{
    role: { 
      type: String, 
      enum: ['user', 'assistant', 'system'], 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
    tokens: { 
      type: Number, 
      default: 0 
    }
  }],
  metadata: {
    petType: String,
    petBreed: String,
    petAge: String,
    totalTokens: { type: Number, default: 0 }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Chat', chatSchema);
```

### User Model (models/User.js) - Enhanced for pet info

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['owner', 'volunteer', 'ngo', 'vet'], 
    default: 'owner' 
  },
  pets: [{
    name: String,
    type: { type: String, enum: ['dog', 'cat', 'bird', 'rabbit', 'other'] },
    breed: String,
    age: Number,
    gender: String,
    weight: Number,
    medicalHistory: [String],
    isActive: { type: Boolean, default: true }
  }],
  preferences: {
    chatReminders: { type: Boolean, default: true },
    healthAlerts: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

## 2. AI Service (services/openaiService.js)

```javascript
const OpenAI = require('openai');

class PetCareAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.systemPrompt = `You are Dr. PawCare, an expert AI veterinary assistant specializing in pet health, behavior, and welfare. 

GUIDELINES:
- Provide accurate, practical advice for pet owners
- Always recommend consulting a veterinarian for serious health issues
- Keep responses concise (under 200 words) but informative
- Ask clarifying questions when needed (pet type, age, symptoms, duration)
- Cover: health symptoms, nutrition, training, behavior, grooming, exercise, emergencies
- Include safety warnings for potentially dangerous situations
- Be empathetic and supportive to worried pet owners

EMERGENCY INDICATORS - Always recommend immediate vet care for:
- Difficulty breathing, choking, or severe injuries
- Seizures, loss of consciousness, or severe lethargy
- Ingestion of toxic substances
- Severe vomiting/diarrhea with blood
- Signs of severe pain or distress

RESPONSE FORMAT:
- Start with acknowledgment of concern
- Provide practical advice or information
- Include when to seek professional help
- End with supportive encouragement

If the question is not pet-related, politely redirect to pet care topics.`;
  }

  async getChatResponse(userMessage, chatHistory = [], userPetInfo = null) {
    try {
      // Build context with pet information if available
      let contextPrompt = this.systemPrompt;
      
      if (userPetInfo && userPetInfo.length > 0) {
        const petContext = userPetInfo.map(pet => 
          `Pet: ${pet.name} (${pet.type}, ${pet.breed || 'mixed'}, ${pet.age || 'unknown age'})`
        ).join('; ');
        contextPrompt += `\n\nUSER'S PETS: ${petContext}`;
      }

      // Prepare messages for OpenAI
      const messages = [
        { role: 'system', content: contextPrompt },
        ...chatHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: userMessage }
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      return {
        content: response.choices[0].message.content,
        tokens: response.usage.total_tokens,
        model: 'gpt-3.5-turbo'
      };

    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Provide fallback response
      if (error.code === 'insufficient_quota') {
        throw new Error('AI service temporarily unavailable. Please try again later.');
      } else if (error.code === 'rate_limit_exceeded') {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else {
        throw new Error('Unable to process your request. Please try again.');
      }
    }
  }

  // Emergency keyword detection
  detectEmergency(message) {
    const emergencyKeywords = [
      'emergency', 'urgent', 'dying', 'blood', 'seizure', 'choking', 
      'poisoned', 'toxic', 'can\'t breathe', 'unconscious', 'severe pain',
      'hit by car', 'attacked', 'broken bone', 'bloated', 'pale gums'
    ];
    
    const lowerMessage = message.toLowerCase();
    return emergencyKeywords.some(keyword => lowerMessage.includes(keyword));
  }
}

module.exports = new PetCareAIService();
```

## 3. Controllers (controllers/chatController.js)

```javascript
const Chat = require('../models/Chat');
const User = require('../models/User');
const aiService = require('../services/openaiService');
const rateLimit = require('express-rate-limit');

// Rate limiting for chat API
const chatRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window per IP
  message: 'Too many chat requests, please try again later.'
});

class ChatController {
  
  // Main chat endpoint
  async handleChat(req, res) {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user.id; // From auth middleware

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Check for emergency keywords
      if (aiService.detectEmergency(message)) {
        const emergencyResponse = {
          reply: "🚨 This sounds like a potential emergency. Please contact your nearest veterinary clinic or emergency animal hospital immediately. If it's after hours, call an emergency vet hotline. Your pet's safety is the top priority.",
          isEmergency: true
        };
        
        // Still save the interaction for tracking
        await this.saveChatMessage(userId, sessionId, message, emergencyResponse.reply, true);
        return res.json(emergencyResponse);
      }

      // Get or create chat session
      let chat = await Chat.findOne({ 
        userId, 
        sessionId: sessionId || { $exists: false },
        isActive: true 
      });

      if (!chat) {
        chat = new Chat({
          userId,
          sessionId: sessionId || new mongoose.Types.ObjectId().toString(),
          messages: []
        });
      }

      // Get user's pet information for context
      const user = await User.findById(userId).select('pets');
      const activePets = user?.pets?.filter(pet => pet.isActive) || [];

      // Prepare chat history
      const chatHistory = chat.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get AI response
      const aiResponse = await aiService.getChatResponse(message, chatHistory, activePets);

      // Save user message
      chat.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Save AI response
      chat.messages.push({
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        tokens: aiResponse.tokens
      });

      // Update metadata
      chat.metadata.totalTokens += aiResponse.tokens;
      chat.updatedAt = new Date();

      await chat.save();

      res.json({ 
        reply: aiResponse.content,
        sessionId: chat.sessionId,
        tokens: aiResponse.tokens
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        error: error.message || 'Unable to process your request. Please try again.' 
      });
    }
  }

  // Get chat history
  async getChatHistory(req, res) {
    try {
      const userId = req.user.id;
      const { sessionId, limit = 50 } = req.query;

      const query = { userId, isActive: true };
      if (sessionId) query.sessionId = sessionId;

      const chats = await Chat.find(query)
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit))
        .select('sessionId messages metadata createdAt updatedAt');

      res.json({ chats });

    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ error: 'Unable to fetch chat history' });
    }
  }

  // Clear chat session
  async clearChat(req, res) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      await Chat.findOneAndUpdate(
        { userId, sessionId },
        { isActive: false }
      );

      res.json({ message: 'Chat session cleared successfully' });

    } catch (error) {
      console.error('Clear chat error:', error);
      res.status(500).json({ error: 'Unable to clear chat session' });
    }
  }

  // Helper method to save chat interactions
  async saveChatMessage(userId, sessionId, userMessage, aiResponse, isEmergency = false) {
    try {
      let chat = await Chat.findOne({ userId, sessionId, isActive: true });
      
      if (!chat) {
        chat = new Chat({ userId, sessionId: sessionId || new mongoose.Types.ObjectId().toString(), messages: [] });
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

      await chat.save();
      return chat;

    } catch (error) {
      console.error('Save chat message error:', error);
    }
  }
}

module.exports = { 
  chatController: new ChatController(), 
  chatRateLimit 
};
```

## 4. Routes (routes/chat.js)

```javascript
const express = require('express');
const router = express.Router();
const { chatController, chatRateLimit } = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

// Apply rate limiting to all chat routes
router.use(chatRateLimit);

// Main chat endpoint
router.post('/postQ', authMiddleware, chatController.handleChat.bind(chatController));

// Get chat history
router.get('/history', authMiddleware, chatController.getChatHistory.bind(chatController));

// Clear chat session
router.delete('/session/:sessionId', authMiddleware, chatController.clearChat.bind(chatController));

module.exports = router;
```

## 5. Server Setup (server.js)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/chat', require('./routes/chat'));
app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pet Connect server running on port ${PORT}`);
});
```

## 6. Authentication Middleware (middleware/auth.js)

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
```

## Features Implemented:

1. **Secure AI Chat**: JWT authentication, rate limiting, input validation
2. **Pet-Specific Context**: Uses user's pet information for personalized advice
3. **Emergency Detection**: Automatically detects emergency keywords and provides immediate guidance
4. **Chat History**: Persistent storage of conversations with MongoDB
5. **Token Tracking**: Monitor OpenAI API usage and costs
6. **Error Handling**: Comprehensive error handling with fallback responses
7. **Performance**: Optimized queries, rate limiting, and efficient context management

## Deployment Notes:

- Set up MongoDB Atlas for production database
- Configure OpenAI API key in production environment
- Use Redis for session management in production
- Implement proper logging and monitoring
- Set up SSL/HTTPS for secure communication
- Consider implementing WebSocket for real-time chat

This backend provides a complete, production-ready foundation for the AI Pet Advice Chatbot feature!