const Session = require('../models/Session');
const { v4: uuidv4 } = require('uuid');

// Create a new realtime session
const createSession = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const userId = req.user._id;

        const sessionId = uuidv4();
        const session = new Session({
            sessionId,
            participants: [userId, receiverId],
            status: 'active',
            sharedResources: []
        });

        await session.save();

        res.status(201).json({
            message: 'Session created successfully',
            session
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get session details
const getSession = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await Session.findOne({ sessionId: id })
            .populate('participants', 'name avatar email');

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Share a resource inside the session
const shareResource = async (req, res) => {
    try {
        const { sessionId, type, url, title } = req.body;
        const userId = req.user._id;

        const session = await Session.findOne({ sessionId });
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Optional: verify participant
        if (!session.participants.includes(userId)) {
            return res.status(403).json({ message: 'Not a participant of this session' });
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

        // The socket server can also emit things, but the API just saves it.
        res.status(200).json({
            message: 'Resource shared successfully',
            resource: newResource
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createSession,
    getSession,
    shareResource
};
