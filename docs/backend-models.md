# PetConnect Backend Models

## User Model (models/User.js)

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['dog', 'cat', 'bird', 'rabbit', 'fish', 'hamster', 'other'],
    required: true
  },
  breed: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    min: 0
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unknown']
  },
  weight: {
    type: Number,
    min: 0
  },
  color: String,
  medicalHistory: [String],
  vaccinations: [{
    name: String,
    date: Date,
    nextDue: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  photos: [String]
}, {
  timestamps: true
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/petconnect/image/upload/v1234567890/avatars/default-avatar.png'
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['owner', 'volunteer', 'ngo', 'vet', 'admin'],
    default: 'owner'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  pets: [petSchema],
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      showLocation: { type: Boolean, default: true },
      showPets: { type: Boolean, default: true },
      showContact: { type: Boolean, default: false }
    },
    radius: { type: Number, default: 10 } // km for location-based notifications
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastActive: {
    type: Date,
    default: Date.now
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get signed JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
```

## Post Model (models/Post.js)

```javascript
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['classified', 'help', 'lost', 'found', 'discussion'],
    required: true
  },
  category: {
    type: String,
    enum: ['dogs', 'cats', 'birds', 'small-pets', 'reptiles', 'farm-animals', 'other'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    url: String,
    publicId: String, // Cloudinary public ID for deletion
    caption: String
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: function() {
        return ['help', 'lost', 'found'].includes(this.type);
      }
    },
    address: String,
    city: String,
    state: String,
    country: String
  },
  contact: {
    phone: String,
    email: String,
    preferredMethod: {
      type: String,
      enum: ['phone', 'email', 'both'],
      default: 'both'
    }
  },
  petDetails: {
    name: String,
    species: String,
    breed: String,
    age: String,
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown']
    },
    size: {
      type: String,
      enum: ['small', 'medium', 'large', 'extra-large']
    },
    color: String,
    distinguishingMarks: String,
    microchipped: Boolean,
    lastSeen: Date,
    reward: Number
  },
  classifiedDetails: {
    price: {
      type: Number,
      min: 0
    },
    negotiable: {
      type: Boolean,
      default: true
    },
    condition: {
      type: String,
      enum: ['new', 'excellent', 'good', 'fair', 'poor']
    }
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'resolved', 'closed', 'expired'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  tags: [String],
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  responses: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Auto-expire posts after 30 days
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  },
  isReported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Geospatial index for location-based queries
postSchema.index({ location: '2dsphere' });

// Compound indexes for performance
postSchema.index({ type: 1, status: 1, createdAt: -1 });
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ category: 1, type: 1 });

// Text index for search
postSchema.index({ 
  title: 'text', 
  description: 'text', 
  'petDetails.name': 'text',
  'petDetails.breed': 'text'
});

// TTL index for auto-expiring posts
postSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Pre-save middleware to handle urgent posts
postSchema.pre('save', function(next) {
  if (['help', 'lost'].includes(this.type) && this.priority === 'urgent') {
    this.isUrgent = true;
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
```

## Chat Model (models/Chat.js)

```javascript
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  tokens: {
    type: Number,
    default: 0
  },
  metadata: {
    isEmergency: { type: Boolean, default: false },
    confidence: Number,
    intent: String,
    entities: [String]
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    default: function() {
      return new mongoose.Types.ObjectId().toString();
    }
  },
  messages: [messageSchema],
  metadata: {
    petType: String,
    petBreed: String,
    petAge: String,
    totalTokens: { type: Number, default: 0 },
    avgResponseTime: Number,
    userSatisfaction: {
      type: Number,
      min: 1,
      max: 5
    },
    topicTags: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  emergencyFlags: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ sessionId: 1 });
chatSchema.index({ isActive: 1, lastActivity: -1 });

// Update last activity on save
chatSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Virtual for message count
chatSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

module.exports = mongoose.model('Chat', chatSchema);
```

## News Model (models/News.js)

```javascript
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  summary: {
    type: String,
    required: [true, 'Summary is required'],
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  author: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    role: String
  },
  category: {
    type: String,
    enum: ['health', 'adoption', 'community', 'technology', 'legislation', 'research', 'events', 'tips', 'other'],
    required: true
  },
  tags: [String],
  featuredImage: {
    url: String,
    publicId: String,
    caption: String,
    alt: String
  },
  images: [{
    url: String,
    publicId: String,
    caption: String,
    alt: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'scheduled'],
    default: 'draft'
  },
  publishedAt: Date,
  scheduledFor: Date,
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBreaking: {
    type: Boolean,
    default: false
  },
  readTime: {
    type: Number, // in minutes
    default: function() {
      // Estimate reading time (average 200 words per minute)
      const wordCount = this.content.split(' ').length;
      return Math.ceil(wordCount / 200);
    }
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000
    },
    isApproved: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  views: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  seoData: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }]
}, {
  timestamps: true
});

// Indexes
newsSchema.index({ status: 1, publishedAt: -1 });
newsSchema.index({ category: 1, publishedAt: -1 });
newsSchema.index({ isFeatured: 1, publishedAt: -1 });
newsSchema.index({ 'author.userId': 1 });

// Text search index
newsSchema.index({
  title: 'text',
  summary: 'text',
  content: 'text',
  tags: 'text'
});

// Generate slug before saving
newsSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.seoData.slug) {
    this.seoData.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Virtual for like count
newsSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
newsSchema.virtual('commentCount').get(function() {
  return this.comments.filter(comment => comment.isApproved).length;
});

module.exports = mongoose.model('News', newsSchema);
```

These models provide a comprehensive data structure for the PetConnect platform, including:

1. **User Model**: Complete user management with pets, location, preferences
2. **Post Model**: Flexible post system for classifieds, help requests, lost/found pets
3. **Chat Model**: AI chat history with metadata and analytics
4. **News Model**: Full-featured news system with SEO, moderation, and engagement features

All models include proper indexing for performance, validation, and middleware for business logic. The geospatial features enable location-based functionality for nearby pet alerts and help requests.