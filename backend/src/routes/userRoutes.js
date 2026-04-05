const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');

// Protected routes
router.get('/', authenticate, userController.getAllUsers);

// Profile endpoints
router.get('/profile', authenticate, (req, res, next) => { req.params.userId = req.user._id; next(); }, userController.getUserProfile);
router.get('/:userId/profile', authenticate, userController.getUserProfile);
router.get('/:userId', authenticate, userController.getUserById);
router.patch('/profile', authenticate, userController.updateProfile);

module.exports = router;

