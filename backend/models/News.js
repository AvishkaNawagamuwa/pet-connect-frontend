const mongoose = require('mongoose');

// Comment subdocument schema for news
const newsCommentSchema = new mongoose.Schema({
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

// News article schema
const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [10, 'Title must be at least 10 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    summary: {
        type: String,
        required: [true, 'Summary is required'],
        trim: true,
        minlength: [50, 'Summary must be at least 50 characters'],
        maxlength: [500, 'Summary cannot exceed 500 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        trim: true,
        minlength: [100, 'Content must be at least 100 characters'],
        maxlength: [10000, 'Content cannot exceed 10000 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['health', 'nutrition', 'training', 'news', 'tips', 'research'],
        lowercase: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    featuredImage: {
        url: {
            type: String,
            required: [true, 'Featured image is required']
        },
        publicId: String,
        caption: String,
        alt: String
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: String,
        caption: String,
        alt: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    readTime: {
        type: Number, // in minutes
        default: 5
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    targetAudience: [{
        type: String,
        enum: ['pet-owners', 'veterinarians', 'trainers', 'shelters', 'breeders'],
        default: ['pet-owners']
    }],
    relatedPets: [{
        type: String,
        enum: ['dogs', 'cats', 'birds', 'fish', 'rabbits', 'reptiles', 'all'],
        default: ['all']
    }],
    sources: [{
        title: String,
        url: String,
        author: String,
        publishedAt: Date
    }],
    seo: {
        metaTitle: {
            type: String,
            maxlength: [60, 'Meta title cannot exceed 60 characters']
        },
        metaDescription: {
            type: String,
            maxlength: [160, 'Meta description cannot exceed 160 characters']
        },
        keywords: [String],
        canonicalUrl: String
    },
    engagement: {
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
        comments: [newsCommentSchema],
        shares: {
            facebook: {
                type: Number,
                default: 0
            },
            twitter: {
                type: Number,
                default: 0
            },
            pinterest: {
                type: Number,
                default: 0
            },
            email: {
                type: Number,
                default: 0
            },
            total: {
                type: Number,
                default: 0
            }
        },
        bookmarks: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            bookmarkedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    analytics: {
        views: {
            type: Number,
            default: 0
        },
        uniqueViews: {
            type: Number,
            default: 0
        },
        avgTimeOnPage: {
            type: Number, // in seconds
            default: 0
        },
        bounceRate: {
            type: Number, // percentage
            default: 0
        },
        clickThroughRate: {
            type: Number, // percentage
            default: 0
        }
    },
    status: {
        type: String,
        enum: ['draft', 'review', 'published', 'archived'],
        default: 'draft'
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    publishedAt: Date,
    scheduledAt: Date,
    expiresAt: Date,
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    version: {
        type: Number,
        default: 1
    },
    editorial: {
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reviewedAt: Date,
        reviewNotes: String,
        factChecked: {
            type: Boolean,
            default: false
        },
        factCheckedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        factCheckedAt: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
newsSchema.index({ title: 'text', summary: 'text', content: 'text' });
newsSchema.index({ category: 1, isPublished: 1 });
newsSchema.index({ tags: 1 });
newsSchema.index({ author: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ isFeatured: 1, publishedAt: -1 });
newsSchema.index({ slug: 1 }, { unique: true });
newsSchema.index({ status: 1 });
newsSchema.index({ 'analytics.views': -1 });
newsSchema.index({ createdAt: -1 });

// Virtual for like count
newsSchema.virtual('likesCount').get(function () {
    return this.engagement.likes ? this.engagement.likes.length : 0;
});

// Virtual for comment count
newsSchema.virtual('commentsCount').get(function () {
    return this.engagement.comments ? this.engagement.comments.length : 0;
});

// Virtual for bookmark count
newsSchema.virtual('bookmarksCount').get(function () {
    return this.engagement.bookmarks ? this.engagement.bookmarks.length : 0;
});

// Virtual for total shares
newsSchema.virtual('totalShares').get(function () {
    return this.engagement.shares.total || 0;
});

// Virtual for reading time estimation
newsSchema.virtual('estimatedReadTime').get(function () {
    if (this.readTime) return this.readTime;

    // Estimate based on content length (average 200 words per minute)
    const wordCount = this.content.split(' ').length;
    return Math.ceil(wordCount / 200);
});

// Virtual for time since published
newsSchema.virtual('timeAgo').get(function () {
    if (!this.publishedAt) return null;

    const now = new Date();
    const published = this.publishedAt;
    const diffTime = Math.abs(now - published);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
});

// Virtual for SEO-friendly URL
newsSchema.virtual('url').get(function () {
    return `/news/${this.slug}`;
});

// Pre-save middleware to generate slug
newsSchema.pre('save', function (next) {
    if (this.isModified('title') || !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim('-'); // Remove leading/trailing hyphens

        // Add timestamp to ensure uniqueness
        if (!this.slug) {
            this.slug = `article-${Date.now()}`;
        }
    }

    // Update read time based on content
    if (this.isModified('content')) {
        const wordCount = this.content.split(' ').length;
        this.readTime = Math.ceil(wordCount / 200); // 200 words per minute
    }

    // Set published date when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
        this.isPublished = true;
    }

    // Update SEO fields if not set
    if (!this.seo.metaTitle) {
        this.seo.metaTitle = this.title.substring(0, 60);
    }
    if (!this.seo.metaDescription) {
        this.seo.metaDescription = this.summary.substring(0, 160);
    }

    this.updatedAt = new Date();
    next();
});

// Static method to find published articles
newsSchema.statics.findPublished = function (filters = {}) {
    return this.find({
        isPublished: true,
        status: 'published',
        ...filters
    }).sort({ publishedAt: -1 });
};

// Static method to find featured articles
newsSchema.statics.findFeatured = function (limit = 5) {
    return this.findPublished({ isFeatured: true })
        .limit(limit)
        .populate('author', 'name avatar');
};

// Static method to find trending articles
newsSchema.statics.findTrending = function (days = 7, limit = 10) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.findPublished({
        publishedAt: { $gte: since }
    })
        .sort({ 'analytics.views': -1, 'engagement.shares.total': -1 })
        .limit(limit)
        .populate('author', 'name avatar');
};

// Static method to search articles
newsSchema.statics.search = function (searchTerm, filters = {}) {
    return this.find({
        $text: { $search: searchTerm },
        isPublished: true,
        status: 'published',
        ...filters
    }, {
        score: { $meta: 'textScore' }
    }).sort({
        score: { $meta: 'textScore' },
        publishedAt: -1
    });
};

// Static method to find related articles
newsSchema.statics.findRelated = function (articleId, category, tags, limit = 5) {
    return this.findPublished({
        _id: { $ne: articleId },
        $or: [
            { category },
            { tags: { $in: tags } }
        ]
    })
        .limit(limit)
        .select('title slug summary featuredImage author publishedAt readTime')
        .populate('author', 'name avatar');
};

// Instance method to add like
newsSchema.methods.addLike = function (userId) {
    const existingLike = this.engagement.likes.find(like =>
        like.userId.toString() === userId.toString()
    );

    if (!existingLike) {
        this.engagement.likes.push({ userId });
        return this.save();
    }

    return Promise.resolve(this);
};

// Instance method to remove like
newsSchema.methods.removeLike = function (userId) {
    this.engagement.likes = this.engagement.likes.filter(like =>
        like.userId.toString() !== userId.toString()
    );
    return this.save();
};

// Instance method to add comment
newsSchema.methods.addComment = function (userId, text) {
    this.engagement.comments.push({ userId, text });
    return this.save();
};

// Instance method to add bookmark
newsSchema.methods.addBookmark = function (userId) {
    const existingBookmark = this.engagement.bookmarks.find(bookmark =>
        bookmark.userId.toString() === userId.toString()
    );

    if (!existingBookmark) {
        this.engagement.bookmarks.push({ userId });
        return this.save();
    }

    return Promise.resolve(this);
};

// Instance method to remove bookmark
newsSchema.methods.removeBookmark = function (userId) {
    this.engagement.bookmarks = this.engagement.bookmarks.filter(bookmark =>
        bookmark.userId.toString() !== userId.toString()
    );
    return this.save();
};

// Instance method to increment views
newsSchema.methods.incrementViews = function (isUnique = false) {
    this.analytics.views += 1;
    if (isUnique) {
        this.analytics.uniqueViews += 1;
    }
    return this.save();
};

// Instance method to record share
newsSchema.methods.recordShare = function (platform) {
    if (this.engagement.shares[platform] !== undefined) {
        this.engagement.shares[platform] += 1;
        this.engagement.shares.total += 1;
    }
    return this.save();
};

// Instance method to publish article
newsSchema.methods.publish = function () {
    this.status = 'published';
    this.isPublished = true;
    this.publishedAt = new Date();
    return this.save();
};

// Instance method to archive article
newsSchema.methods.archive = function () {
    this.status = 'archived';
    this.isPublished = false;
    return this.save();
};

module.exports = mongoose.model('News', newsSchema);