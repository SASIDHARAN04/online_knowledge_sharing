const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');

// Protected routes
router.get('/', authenticate, userController.getAllUsers);
router.get('/wallet', authenticate, userController.getPointsWallet);
router.get('/:userId', authenticate, userController.getUserById);
router.patch('/profile', authenticate, userController.updateProfile);

module.exports = router;
