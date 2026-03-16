const express = require('express');
const router = express.Router();
const HistoryController = require('../controllers/historyController');
const authenticateToken = require('../middleware/authMiddleware');

/**
 * @route   POST /api/history
 * @desc    Record new conversion history
 * @access  Protected
 */
router.post('/', authenticateToken, HistoryController.createHistory);

/**
 * @route   GET /api/history
 * @desc    Get user's conversion history
 * @access  Protected
 */
router.get('/', authenticateToken, HistoryController.getHistory);

module.exports = router;
