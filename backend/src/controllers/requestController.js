const Request = require('../models/Request');
const User = require('../models/User');

/**
 * Request Controller
 * Handles skill exchange request operations
 */

// Get all requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('sender', 'name email skillsOffered skillsWanted')
      .populate('receiver', 'name email skillsOffered skillsWanted');
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's requests (incoming and outgoing)
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .populate('sender', 'name email skillsOffered skillsWanted avatar')
      .populate('receiver', 'name email skillsOffered skillsWanted avatar');
    
    const incoming = requests.filter(r => r.receiver._id.toString() === req.user._id.toString());
    const outgoing = requests.filter(r => r.sender._id.toString() === req.user._id.toString());

    res.json({ incoming, outgoing });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create request
const createRequest = async (req, res) => {
  try {
    const { receiverId, skillExchange } = req.body;

    if (req.user._id.toString() === receiverId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    const request = new Request({
      sender: req.user._id,
      receiver: receiverId,
      skillExchange,
      status: 'Pending'
    });

    await request.save();

    // Create a persistent notification for the recipient
    try {
      const Notification = require('../models/Notification');
      const newNotification = new Notification({
        recipient: receiverId,
        sender: req.user._id,
        type: 'request',
        message: `${req.user.name} sent you a learning request for ${skillExchange}`
      });
      await newNotification.save();
    } catch (notificationError) {
      console.error('Error creating request notification:', notificationError);
    }

    const populatedRequest = await Request.findById(request._id)
      .populate('sender', 'name email skillsOffered skillsWanted avatar')
      .populate('receiver', 'name email skillsOffered skillsWanted avatar');

    res.status(201).json({
      message: 'Request created successfully',
      request: populatedRequest
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating request', error: error.message });
  }
};

// Accept/Reject request
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only receiver can accept/reject
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    // If accepted, we might want to create a Match record too.
    if (status === 'Accepted') {
      const Match = require('../models/Match');
      const match = new Match({
        user1: request.sender,
        user2: request.receiver,
        matchedSkills: [request.skillExchange],
        status: 'Accepted'
      });
      await match.save();
    }

    const populatedRequest = await Request.findById(request._id)
      .populate('sender', 'name email skillsOffered skillsWanted avatar')
      .populate('receiver', 'name email skillsOffered skillsWanted avatar');

    res.json({
      message: `Request ${status.toLowerCase()} successfully`,
      request: populatedRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllRequests,
  getMyRequests,
  createRequest,
  updateRequestStatus
};
