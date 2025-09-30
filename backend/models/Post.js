const mongoose = require('mongoose');

// Comment subdocument schema
const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: [true, 'Comment text is required'],
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    likes: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        likedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Response subdocument schema (for help/lost posts)
const responseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        trim: true,
        maxlength: [500, 'Response message cannot exceed 500 characters']
    },
    contactInfo: {
        phone: String,
        email: String,
        preferredMethod: {
            type: String,
            enum: ['phone', 'email', 'app'],
            default: 'app'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'completed'],
        default: 'pending'
    },
    respondedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pet details subdocument schema
const petDetailsSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: [30, 'Pet name cannot exceed 30 characters']
    },
    age: {
        type: Number,
        min: [0, 'Age cannot be negative'],
        max: [50, 'Age cannot exceed 50 years']
    },
    breed: {
        type: String,
        trim: true,
        maxlength: [50, 'Breed cannot exceed 50 characters']
    },
    color: {
        type: String,
        trim: true,
        maxlength: [50, 'Color cannot exceed 50 characters']
    },
    size: {
        type: String,
        enum: ['small', 'medium', 'large', 'extra-large']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'unknown'],
        default: 'unknown'
    },
    weight: {
        type: Number,
        min: [0, 'Weight cannot be negative']
    },
    distinguishingMarks: {
        type: String,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    temperament: {
        type: String,
        maxlength: [200, 'Temperament description cannot exceed 200 characters']
    },
    medicalConditions: {
        type: String,
        maxlength: [500, 'Medical conditions cannot exceed 500 characters']
    },
    isSpayedNeutered: Boolean,
    isMicrochipped: Boolean,
    microchipId: {
        type: String,
        trim: true
    }
});

// Main post schema
const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    type: {
        type: String,
        required: [true, 'Post type is required'],
        enum: ['lost', 'found', 'adoption', 'help', 'general'],
        lowercase: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['dogs', 'cats', 'birds', 'small-pets', 'reptiles', 'other'],
        lowercase: true
    },
    petDetails: petDetailsSchema,
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: String,
        caption: String,
        isPrimary: {
            type: Boolean,
            default: false
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: false
        },
        address: {
            type: String,
            trim: true,
            maxlength: [200, 'Address cannot exceed 200 characters']
        },
        city: String,
        state: String,
        country: String,
        zipCode: String,
        lastSeenAt: Date // For lost pets
    },
    contactInfo: {
        phone: {
            type: String,
            match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number']
        },
        email: {
            type: String,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
        },
        preferredMethod: {
            type: String,
            enum: ['phone', 'email', 'app'],
            default: 'app'
        }
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'archived'],
        default: 'active'
    },
    isUrgent: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    likes: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        likedAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [commentSchema],
    responses: [responseSchema], // For help/lost posts
    views: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },
    reward: {
        amount: {
            type: Number,
            min: [0, 'Reward amount cannot be negative']
        },
        currency: {
            type: String,
            default: 'USD'
        },
        description: String
    },
    scheduling: {
        expiresAt: Date,
        autoResolveAt: Date,
        reminderAt: Date
    },
    metadata: {
        source: {
            type: String,
            enum: ['web', 'mobile', 'api'],
            default: 'web'
        },
        ipAddress: String,
        userAgent: String,
        socialShares: [{
            platform: {
                type: String,
                enum: ['facebook', 'twitter', 'instagram', 'whatsapp']
            },
            sharedAt: {
                type: Date,
                default: Date.now
            }
        }],
        reportCount: {
            type: Number,
            default: 0
        },
        isReported: {
            type: Boolean,
            default: false
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    resolvedAt: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
postSchema.index({ userId: 1 });
postSchema.index({ type: 1, status: 1 });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ location: '2dsphere' });
postSchema.index({ createdAt: -1 });
postSchema.index({ updatedAt: -1 });
postSchema.index({ status: 1, isActive: 1 });
postSchema.index({ isUrgent: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ title: 'text', description: 'text' });

// Virtual for like count
postSchema.virtual('likesCount').get(function () {
    return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
postSchema.virtual('commentsCount').get(function () {
    return this.comments ? this.comments.length : 0;
});

// Virtual for response count
postSchema.virtual('responsesCount').get(function () {
    return this.responses ? this.responses.length : 0;
});

// Virtual for time since posted
postSchema.virtual('timeAgo').get(function () {
    const now = new Date();
    const posted = this.createdAt;
    const diffTime = Math.abs(now - posted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
});

// Virtual for primary image
postSchema.virtual('primaryImage').get(function () {
    if (!this.images || this.images.length === 0) return null;

    const primary = this.images.find(img => img.isPrimary);
    return primary || this.images[0];
});

// Pre-save middleware to update timestamps
postSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Pre-save middleware to set primary image
postSchema.pre('save', function (next) {
    if (this.images && this.images.length > 0) {
        const hasPrimary = this.images.some(img => img.isPrimary);
        if (!hasPrimary) {
            this.images[0].isPrimary = true;
        }
    }
    next();
});

// Static method to find posts by location
postSchema.statics.findNearby = function (coordinates, maxDistance = 10000, filters = {}) {
    const query = {
        location: {
            $geoNear: {
                $geometry: {
                    type: 'Point',
                    coordinates: coordinates
                },
                $maxDistance: maxDistance,
                $spherical: true
            }
        },
        status: 'active',
        isActive: true,
        ...filters
    };

    return this.find(query);
};

// Static method to find urgent posts
postSchema.statics.findUrgent = function (filters = {}) {
    return this.find({
        isUrgent: true,
        status: 'active',
        isActive: true,
        ...filters
    }).sort({ createdAt: -1 });
};

// Static method to search posts
postSchema.statics.search = function (searchTerm, filters = {}) {
    return this.find({
        $text: { $search: searchTerm },
        status: 'active',
        isActive: true,
        ...filters
    }, {
        score: { $meta: 'textScore' }
    }).sort({
        score: { $meta: 'textScore' },
        createdAt: -1
    });
};

// Instance method to add like
postSchema.methods.addLike = function (userId) {
    const existingLike = this.likes.find(like =>
        like.userId.toString() === userId.toString()
    );

    if (!existingLike) {
        this.likes.push({ userId });
        return this.save();
    }

    return Promise.resolve(this);
};

// Instance method to remove like
postSchema.methods.removeLike = function (userId) {
    this.likes = this.likes.filter(like =>
        like.userId.toString() !== userId.toString()
    );
    return this.save();
};

// Instance method to add comment
postSchema.methods.addComment = function (userId, text) {
    this.comments.push({ userId, text });
    return this.save();
};

// Instance method to add response
postSchema.methods.addResponse = function (userId, responseData) {
    this.responses.push({
        userId,
        ...responseData
    });
    return this.save();
};

// Instance method to mark as resolved
postSchema.methods.markResolved = function () {
    this.status = 'resolved';
    this.resolvedAt = new Date();
    return this.save();
};

// Instance method to increment views
postSchema.methods.incrementViews = function () {
    this.views += 1;
    return this.save();
};

module.exports = mongoose.model('Post', postSchema);