const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

// Fetch recent notifications
router.get('/', authenticate, notificationController.getNotifications);

// Mark a single notification as read
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// Mark all as read
router.post('/read-all', authenticate, notificationController.markAllAsRead);

module.exports = router;
