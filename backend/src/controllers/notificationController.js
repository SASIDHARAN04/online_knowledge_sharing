const Notification = require('../models/Notification');

/**
 * Notification Controller
 * Handles retrieval and state management of user notifications.
 */

// Get personal notifications for the current user
const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('sender', 'name avatar');

        res.json({ success: true, notifications });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Mark a single notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
        console.error('Error marking notification read:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Mark all unread notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Error marking all notifications read:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
