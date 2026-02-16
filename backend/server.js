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
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const io = initSocket(server);
  app.set('io', io); // make io accessible in controllers via req.app.get('io')

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
