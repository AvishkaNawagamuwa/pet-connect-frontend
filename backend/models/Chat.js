const mongoose = require('mongoose');

// Message subdocument schema
const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
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
        isEmergency: {
            type: Boolean,
            default: false
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1
        },
        responseTime: Number, // in milliseconds
        model: {
            type: String,
            default: 'gpt-3.5-turbo'
        },
        temperature: {
            type: Number,
            default: 0.7
        }
    }
});

// Chat session schema
const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    messages: [messageSchema],
    metadata: {
        totalTokens: {
            type: Number,
            default: 0
        },
        totalMessages: {
            type: Number,
            default: 0
        },
        averageResponseTime: {
            type: Number,
            default: 0
        },
        userSatisfaction: {
            type: Number,
            min: 1,
            max: 5
        },
        topicsDiscussed: [{
            topic: String,
            count: {
                type: Number,
                default: 1
            }
        }],
        emergencyFlags: {
            type: Number,
            default: 0
        },
        source: {
            type: String,
            enum: ['web', 'mobile', 'widget'],
            default: 'web'
        },
        userAgent: String,
        ipAddress: String
    },
    context: {
        userPets: [{
            name: String,
            type: String,
            breed: String,
            age: Number
        }],
        previousQuestions: [String],
        sessionGoal: String, // What the user is trying to achieve
        userExpertiseLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        }
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned', 'escalated'],
        default: 'active'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    duration: Number // in milliseconds
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
chatSchema.index({ userId: 1, sessionId: 1 });
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ isActive: 1, lastActivity: -1 });
chatSchema.index({ status: 1 });
chatSchema.index({ 'metadata.emergencyFlags': -1 });

// Virtual for session duration
chatSchema.virtual('sessionDuration').get(function () {
    if (this.completedAt) {
        return this.completedAt - this.createdAt;
    }
    return Date.now() - this.createdAt;
});

// Virtual for message count
chatSchema.virtual('messageCount').get(function () {
    return this.messages ? this.messages.length : 0;
});

// Virtual for user message count
chatSchema.virtual('userMessageCount').get(function () {
    return this.messages ? this.messages.filter(msg => msg.role === 'user').length : 0;
});

// Virtual for assistant message count
chatSchema.virtual('assistantMessageCount').get(function () {
    return this.messages ? this.messages.filter(msg => msg.role === 'assistant').length : 0;
});

// Virtual for average tokens per message
chatSchema.virtual('averageTokensPerMessage').get(function () {
    if (!this.messages || this.messages.length === 0) return 0;

    const totalTokens = this.messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0);
    return Math.round(totalTokens / this.messages.length);
});

// Virtual for last message
chatSchema.virtual('lastMessage').get(function () {
    return this.messages && this.messages.length > 0
        ? this.messages[this.messages.length - 1]
        : null;
});

// Pre-save middleware to update metadata
chatSchema.pre('save', function (next) {
    // Update total messages
    this.metadata.totalMessages = this.messages.length;

    // Update total tokens
    this.metadata.totalTokens = this.messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0);

    // Update average response time
    const assistantMessages = this.messages.filter(msg => msg.role === 'assistant');
    if (assistantMessages.length > 0) {
        const totalResponseTime = assistantMessages.reduce((sum, msg) =>
            sum + (msg.metadata?.responseTime || 0), 0);
        this.metadata.averageResponseTime = Math.round(totalResponseTime / assistantMessages.length);
    }

    // Update emergency flags
    this.metadata.emergencyFlags = this.messages.filter(msg =>
        msg.metadata?.isEmergency === true).length;

    // Update last activity
    this.lastActivity = new Date();

    next();
});

// Static method to find active sessions for user
chatSchema.statics.findActiveSessions = function (userId) {
    return this.find({
        userId,
        isActive: true,
        status: 'active'
    }).sort({ lastActivity: -1 });
};

// Static method to find sessions by date range
chatSchema.statics.findByDateRange = function (userId, startDate, endDate) {
    return this.find({
        userId,
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ createdAt: -1 });
};

// Static method to get user chat statistics
chatSchema.statics.getUserStats = async function (userId) {
    const stats = await this.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalSessions: { $sum: 1 },
                totalMessages: { $sum: '$metadata.totalMessages' },
                totalTokens: { $sum: '$metadata.totalTokens' },
                averageSatisfaction: { $avg: '$metadata.userSatisfaction' },
                emergencyCount: { $sum: '$metadata.emergencyFlags' },
                totalDuration: { $sum: '$duration' }
            }
        }
    ]);

    return stats[0] || {
        totalSessions: 0,
        totalMessages: 0,
        totalTokens: 0,
        averageSatisfaction: 0,
        emergencyCount: 0,
        totalDuration: 0
    };
};

// Instance method to add message
chatSchema.methods.addMessage = function (role, content, metadata = {}) {
    const message = {
        role,
        content,
        timestamp: new Date(),
        metadata
    };

    this.messages.push(message);
    return this.save();
};

// Instance method to complete session
chatSchema.methods.completeSession = function () {
    this.status = 'completed';
    this.isActive = false;
    this.completedAt = new Date();
    this.duration = this.completedAt - this.createdAt;
    return this.save();
};

// Instance method to abandon session
chatSchema.methods.abandonSession = function () {
    this.status = 'abandoned';
    this.isActive = false;
    this.completedAt = new Date();
    this.duration = this.completedAt - this.createdAt;
    return this.save();
};

// Instance method to escalate session
chatSchema.methods.escalateSession = function () {
    this.status = 'escalated';
    return this.save();
};

// Instance method to rate session
chatSchema.methods.rateSatisfaction = function (rating) {
    if (rating >= 1 && rating <= 5) {
        this.metadata.userSatisfaction = rating;
        return this.save();
    }
    throw new Error('Rating must be between 1 and 5');
};

// Instance method to get session summary
chatSchema.methods.getSummary = function () {
    const userMessages = this.messages.filter(msg => msg.role === 'user');
    const assistantMessages = this.messages.filter(msg => msg.role === 'assistant');

    return {
        sessionId: this.sessionId,
        duration: this.sessionDuration,
        messageCount: this.messages.length,
        userMessageCount: userMessages.length,
        assistantMessageCount: assistantMessages.length,
        totalTokens: this.metadata.totalTokens,
        averageResponseTime: this.metadata.averageResponseTime,
        emergencyFlags: this.metadata.emergencyFlags,
        satisfaction: this.metadata.userSatisfaction,
        status: this.status,
        createdAt: this.createdAt,
        completedAt: this.completedAt
    };
};

// Static method to clean up old inactive sessions
chatSchema.statics.cleanupOldSessions = async function () {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

    const result = await this.deleteMany({
        isActive: false,
        status: { $in: ['abandoned', 'completed'] },
        lastActivity: { $lt: cutoffDate }
    });

    return result.deletedCount;
};

// TTL index to automatically delete inactive sessions after 90 days
chatSchema.index(
    { lastActivity: 1 },
    {
        expireAfterSeconds: 90 * 24 * 60 * 60, // 90 days
        partialFilterExpression: { isActive: false }
    }
);

module.exports = mongoose.model('Chat', chatSchema);