const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middlewares/auth');

// Protected routes
router.get('/:userId', authenticate, chatController.getMessages);

module.exports = router;
