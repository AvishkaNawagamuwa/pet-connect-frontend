const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Debug: Check if MONGODB_URI is loaded
        console.log('MongoDB URI:', process.env.MONGODB_URI);

        if (!process.env.MONGODB_URI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        // Try to connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.log('MongoDB connection failed, running in demo mode...');
        console.log('Error:', error.message);

        // Create a mock database connection for demo purposes
        console.log('🔄 Running in DEMO MODE - No database required');
        console.log('💡 To use full features, install MongoDB or use MongoDB Atlas');

        return null;
    }
};

module.exports = connectDB;