const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get tokens
 * @access  Public
 */
router.post('/login', AuthController.login);

module.exports = router;
