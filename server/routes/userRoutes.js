const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

/**
 * @route   PATCH /api/user/profile
 * @desc    Update user profile info
 * @access  Protected
 */
router.patch('/profile', authenticateToken, UserController.updateProfile);

/**
 * @route   PATCH /api/user/password
 * @desc    Change user password
 * @access  Protected
 */
router.patch('/password', authenticateToken, UserController.changePassword);

/**
 * @route   DELETE /api/user/account
 * @desc    Delete user account
 * @access  Protected
 */
router.delete('/account', authenticateToken, UserController.deleteAccount);

module.exports = router;
