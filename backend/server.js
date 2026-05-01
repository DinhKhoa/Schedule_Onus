const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const routes = require('./routes');
const { initSocket } = require('./socket');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// For Vercel serverless, connect to DB before handling requests
let isConnecting = false;
let isConnected = false;

if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    if (isConnected) {
      return next();
    }
    
    if (isConnecting) {
      // Wait for connection to complete
      const maxWait = 20; // 20 seconds
      let waited = 0;
      while (!isConnected && waited < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 500));
        waited += 0.5;
      }
      if (isConnected) {
        return next();
      }
      return res.status(500).json({ error: 'Database connection timeout' });
    }
    
    isConnecting = true;
    try {
      await connectDB();
      isConnected = true;
      isConnecting = false;
      console.log('Database connected in serverless environment');
      next();
    } catch (error) {
      isConnecting = false;
      console.error('Database connection error:', error);
      return res.status(500).json({ error: 'Database connection failed: ' + error.message });
    }
  });
}

// Routes
// Hỗ trợ cả đường dẫn có /api và không có /api (cho Vercel)
app.use(['/api', '/'], routes);

// Error handler
app.use(errorHandler);

// Start server (only for local development)
const PORT = process.env.PORT || 5000;

// Initialize database connection and socket for non-serverless environments
if (!process.env.VERCEL) {
  connectDB().then(() => {
    const io = initSocket(server);
    app.set('io', io);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
