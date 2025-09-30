const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Pet subdocument schema
const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Pet name is required'],
        trim: true,
        maxlength: [30, 'Pet name cannot exceed 30 characters']
    },
    type: {
        type: String,
        required: [true, 'Pet type is required'],
        enum: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'guinea pig', 'reptile', 'other'],
        lowercase: true
    },
    breed: {
        type: String,
        trim: true,
        maxlength: [50, 'Breed cannot exceed 50 characters']
    },
    age: {
        type: Number,
        min: [0, 'Age cannot be negative'],
        max: [50, 'Age cannot exceed 50 years']
    },
    weight: {
        type: Number,
        min: [0, 'Weight cannot be negative']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'unknown'],
        default: 'unknown'
    },
    color: {
        type: String,
        trim: true,
        maxlength: [30, 'Color cannot exceed 30 characters']
    },
    isSpayedNeutered: {
        type: Boolean,
        default: false
    },
    medicalNotes: {
        type: String,
        maxlength: [500, 'Medical notes cannot exceed 500 characters']
    },
    photos: [{
        url: String,
        publicId: String,
        caption: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

// User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    username: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple documents with null/undefined username
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [3, 'Password must be at least 3 characters'],
        select: false // Don't return password by default
    },
    role: {
        type: String,
        enum: ['owner', 'veterinarian', 'shelter', 'admin'],
        default: 'owner'
    },
    avatar: {
        url: {
            type: String,
            default: ''
        },
        publicId: {
            type: String,
            default: ''
        }
    },
    phone: {
        type: String,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number']
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
        address: {
            type: String,
            trim: true,
            maxlength: [200, 'Address cannot exceed 200 characters']
        },
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    pets: [petSchema],
    preferences: {
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            }
        },
        privacy: {
            showLocation: {
                type: Boolean,
                default: true
            },
            showPhone: {
                type: Boolean,
                default: false
            },
            profileVisibility: {
                type: String,
                enum: ['public', 'registered', 'private'],
                default: 'registered'
            }
        },
        language: {
            type: String,
            default: 'en'
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    },
    verification: {
        isVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationToken: String,
        emailVerificationExpires: Date,
        phoneVerificationCode: String,
        phoneVerificationExpires: Date
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    security: {
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: String,
        loginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        passwordChangedAt: Date
    },
    social: {
        facebook: {
            id: String,
            email: String
        },
        google: {
            id: String,
            email: String
        }
    },
    stats: {
        postsCount: {
            type: Number,
            default: 0
        },
        helpedCount: {
            type: Number,
            default: 0
        },
        reputation: {
            type: Number,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
userSchema.index({ location: '2dsphere' });
userSchema.index({ 'pets.type': 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ joinedAt: -1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function () {
    return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    // Only run if password was modified
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        this.password = await bcrypt.hash(this.password, 12);

        // Set password changed timestamp
        if (!this.isNew) {
            this.security.passwordChangedAt = Date.now() - 1000;
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware to update coordinates if address changes
userSchema.pre('save', async function (next) {
    if (this.isModified('location.address') && this.location.address) {
        // In a real app, you would geocode the address here
        // For now, we'll just set default coordinates
        // TODO: Implement geocoding with Google Maps API
    }
    next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Instance method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.security.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.security.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Instance method to generate email verification token
userSchema.methods.createEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    this.verification.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    this.verification.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return verificationToken;
};

// Instance method to handle login attempts
userSchema.methods.incLoginAttempts = function () {
    // If we have a previous lock that has expired, restart at 1
    if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { 'security.lockUntil': 1 },
            $set: { 'security.loginAttempts': 1 }
        });
    }

    const updates = { $inc: { 'security.loginAttempts': 1 } };

    // Lock account after 5 failed attempts for 2 hours
    if (this.security.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { 'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000 };
    }

    return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $unset: {
            'security.loginAttempts': 1,
            'security.lockUntil': 1
        }
    });
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function (email, password) {
    const user = await this.findOne({
        email,
        isActive: true
    }).select('+password');

    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked) {
        throw new Error('Account is temporarily locked due to too many failed login attempts');
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        // Increment login attempts
        await user.incLoginAttempts();
        throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    if (user.security.loginAttempts > 0) {
        await user.resetLoginAttempts();
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    return user;
};

// Static method to find nearby users
userSchema.statics.findNearby = function (coordinates, maxDistance = 10000) {
    return this.find({
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
        isActive: true,
        'preferences.privacy.showLocation': true
    });
};

module.exports = mongoose.model('User', userSchema);