const VideoSession = require('../models/VideoSession');
const { v4: uuidv4 } = require('uuid');

/**
 * Session Controller
 * Handles video call session management
 */

// Create a new video session
const createSession = async (req, res) => {
  try {
    const { receiverId, skillExchange } = req.body;
    const userId = req.user._id;

    const sessionId = uuidv4();
    const meetingLink = `/video-call/${sessionId}`;

    const session = new VideoSession({
      participants: [userId, receiverId],
      skillExchange,
      meetingLink,
      status: 'Active'
    });

    await session.save();

    res.status(201).json({
      message: 'Video session created successfully',
      session
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get session details
const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await VideoSession.findOne({ meetingLink: `/video-call/${sessionId}` })
      .populate('participants', 'name avatar');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Join session (verify participant)
const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await VideoSession.findOne({ meetingLink: `/video-call/${sessionId}` });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (!session.participants.includes(userId)) {
      return res.status(403).json({ message: 'You are not a participant in this session' });
    }

    res.json({ message: 'Access granted', session });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Share a resource inside the video session
const shareResource = async (req, res) => {
  try {
    const { sessionId, type, url, title } = req.body;
    const userId = req.user._id;

    // Use meetingLink to find the session if sessionId matches the uuid
    const session = await VideoSession.findOne({ meetingLink: `/video-call/${sessionId}` });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const newResource = {
      type,
      url,
      title,
      sharedBy: userId,
      timestamp: new Date()
    };

    session.sharedResources.push(newResource);
    await session.save();

    res.status(200).json({ message: 'Resource shared', resource: newResource });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createSession,
  getSession,
  joinSession,
  shareResource
};
