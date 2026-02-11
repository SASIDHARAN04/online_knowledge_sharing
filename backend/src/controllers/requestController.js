const Request = require('../models/Request');
const User = require('../models/User');

/**
 * Request Controller
 * Handles teaching/learning request operations
 */

// Get all requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('sender', 'username email role skills')
      .populate('recipient', 'username email role skills');
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's requests (incoming and outgoing)
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }]
    })
      .populate('sender', 'username email role skills')
      .populate('recipient', 'username email role skills');
    
    const incoming = requests.filter(r => r.recipient._id.toString() === req.user._id.toString());
    const outgoing = requests.filter(r => r.sender._id.toString() === req.user._id.toString());

    res.json({ incoming, outgoing });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create request
const createRequest = async (req, res) => {
  try {
    const { recipientId, type, details } = req.body;

    if (req.user._id.toString() === recipientId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    const request = new Request({
      sender: req.user._id,
      recipient: recipientId,
      type,
      details,
      status: 'Pending'
    });

    await request.save();
    const populatedRequest = await Request.findById(request._id)
      .populate('sender', 'username email role skills')
      .populate('recipient', 'username email role skills');

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

    // Only recipient can accept/reject
    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    // Award points when accepted
    if (status === 'Accepted') {
      const sender = await User.findById(request.sender);
      const recipient = await User.findById(request.recipient);
      
      if (request.type === 'Teach') {
        sender.points += 15; // Points for teaching
      } else if (request.type === 'Learn') {
        recipient.points += 15; // Points for learning
      }
      
      await sender.save();
      await recipient.save();
    }

    const populatedRequest = await Request.findById(request._id)
      .populate('sender', 'username email role skills')
      .populate('recipient', 'username email role skills');

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
