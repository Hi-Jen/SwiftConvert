const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Middleware
const authenticateToken = require('./middleware/authMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Base Middlewares
app.use(cors());
app.use(express.json());

// Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile (Protected)
 * @access  Protected
 */
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Error Handling Middleware (Must be last)
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
