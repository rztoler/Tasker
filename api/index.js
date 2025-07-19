const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB, initializeDatabase } = require('../services/supabase');
const securityMiddleware = require('../middleware/security');
const errorHandler = require('../middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(securityMiddleware.sanitizeInput);
app.use(securityMiddleware.validateContentType);

// Initialize database connection
connectDB().then(() => {
  initializeDatabase();
}).catch(err => console.error('Database connection error:', err));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/clients', require('../routes/clients'));
app.use('/projects', require('../routes/projects'));
app.use('/tasks', require('../routes/tasks'));
app.use('/events', require('../routes/events'));
app.use('/calendar', require('../routes/calendar'));

app.use(errorHandler);

module.exports = app;