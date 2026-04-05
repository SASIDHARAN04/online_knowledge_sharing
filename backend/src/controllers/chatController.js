const Message = require('../models/Message');

/**
 * Chat Controller
 * Handles retrieving messages
 */

// Get message history between two users
const getMessages = async (req, res) => {
  try {
    const userId1 = req.user._id;
    const userId2 = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMessages
};
