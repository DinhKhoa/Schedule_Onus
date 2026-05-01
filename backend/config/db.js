const mongoose = require('mongoose');

// Global connection promise to reuse across function invocations
let cachedConnection = null;

const connectDB = async () => {
  try {
    // Reuse existing connection if available
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log('MongoDB: Using cached connection');
      return cachedConnection;
    }

    // If connecting, wait for it
    if (mongoose.connection.readyState === 2) {
      console.log('MongoDB: Connection in progress, waiting...');
      await new Promise(resolve => {
        mongoose.connection.once('connected', resolve);
      });
      return mongoose.connection;
    }

    console.log('MongoDB: Creating new connection...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
    });
    
    cachedConnection = conn;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    cachedConnection = null;
    
    // Don't exit in serverless environment
    if (process.env.VERCEL) {
      throw error; // Let the caller handle it
    }
    process.exit(1);
  }
};

module.exports = connectDB;
