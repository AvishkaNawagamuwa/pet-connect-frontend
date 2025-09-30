# PetConnect Backend - Complete MERN Stack Implementation

This is the complete backend implementation for the PetConnect application, featuring all the requested functionality including AI chatbot, real-time features, and comprehensive pet care platform capabilities.

## Project Structure

```
petconnect-backend/
├── server.js
├── package.json
├── .env.example
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   ├── Post.js
│   ├── Chat.js
│   └── News.js
├── routes/
│   ├── auth.js
│   ├── posts.js
│   ├── chat.js
│   ├── news.js
│   └── dashboard.js
├── controllers/
│   ├── authController.js
│   ├── postController.js
│   ├── chatController.js
│   ├── newsController.js
│   └── dashboardController.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── upload.js
└── uploads/
```

## Installation & Setup

### 1. Initialize the project

```bash
mkdir petconnect-backend
cd petconnect-backend
npm init -y
```

### 2. Install Dependencies

```bash
npm install express mongoose bcryptjs jsonwebtoken socket.io openai multer cloudinary dotenv cors helmet express-rate-limit joi express-validator nodemailer @google/maps
npm install -D nodemon concurrently
```

### 3. Create package.json scripts

```json
{
  "name": "petconnect-backend",
  "version": "1.0.0",
  "description": "Complete backend for PetConnect - MERN Stack Pet Care Platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "@google/maps": "^2.0.1",
    "bcryptjs": "^2.4.3",
    "cloudinary": "^1.41.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "joi": "^17.11.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "openai": "^4.20.1",
    "socket.io": "^4.7.4"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "nodemon": "^3.0.2"
  },
  "keywords": [
    "petcare",
    "mern",
    "socket.io",
    "ai",
    "openai",
    "pet",
    "community"
  ],
  "author": "PetConnect Team",
  "license": "MIT"
}
```

## Environment Configuration

### .env.example
```env
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/petconnect

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Backend Implementation Files

The following sections contain the complete code for each file in the backend. Copy each section into the appropriate file in your project structure.

---

## Server Configuration (server.js)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/uploads', express.static('uploads'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join user to their room for notifications
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Join location-based room for nearby alerts
  socket.on('joinLocation', (locationData) => {
    const { lat, lng, radius } = locationData;
    const roomName = `location_${Math.floor(lat)}_${Math.floor(lng)}`;
    socket.join(roomName);
    console.log(`User joined location room: ${roomName}`);
  });

  // Handle chat messages
  socket.on('sendMessage', (messageData) => {
    socket.to(messageData.recipientId).emit('newMessage', messageData);
  });

  // Handle post notifications
  socket.on('newPost', (postData) => {
    socket.broadcast.emit('newPostNotification', postData);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/news', require('./routes/news'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PetConnect API Server',
    version: '1.0.0',
    documentation: '/api/docs',
    status: 'Running'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 PetConnect Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = { app, io };
```

---

## Database Configuration (config/db.js)

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);

    // Create indexes for geospatial queries
    await createIndexes();
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Create 2dsphere index for location-based queries
    await db.collection('posts').createIndex({ location: '2dsphere' });
    await db.collection('users').createIndex({ location: '2dsphere' });
    
    // Create text indexes for search functionality
    await db.collection('posts').createIndex({ 
      title: 'text', 
      description: 'text' 
    });
    await db.collection('news').createIndex({ 
      title: 'text', 
      content: 'text' 
    });
    
    console.log('📊 Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = connectDB;
```

---

This is the beginning of the complete backend implementation. The file is quite extensive, so I'll continue with the models, controllers, routes, and middleware in the next sections. Would you like me to continue with the remaining backend files?