const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Reuse existing connection if available
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return mongoose.connection;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Don't exit in serverless environment
    if (process.env.VERCEL) {
      throw error; // Let the caller handle it
    }
    process.exit(1);
  }
};

module.exports = connectDB;
