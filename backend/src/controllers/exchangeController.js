const Exchange = require('../models/Exchange');
const User = require('../models/User');

/**
 * Exchange Controller
 * Handles mutual knowledge exchange operations
 */

// Get all exchanges
const getAllExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.find()
      .populate('requester', 'username email role skills')
      .populate('provider', 'username email role skills');
    res.json({ exchanges });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's exchanges
const getMyExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.find({
      $or: [{ requester: req.user._id }, { provider: req.user._id }]
    })
      .populate('requester', 'username email role skills')
      .populate('provider', 'username email role skills');
    res.json({ exchanges });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create exchange request
const createExchange = async (req, res) => {
  try {
    const { providerId, skillOffered, skillRequested } = req.body;

    if (req.user._id.toString() === providerId) {
      return res.status(400).json({ message: 'Cannot exchange with yourself' });
    }

    const exchange = new Exchange({
      requester: req.user._id,
      provider: providerId,
      skillOffered,
      skillRequested,
      status: 'Pending'
    });

    await exchange.save();
    const populatedExchange = await Exchange.findById(exchange._id)
      .populate('requester', 'username email role skills')
      .populate('provider', 'username email role skills');

    res.status(201).json({
      message: 'Exchange request created',
      exchange: populatedExchange
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating exchange', error: error.message });
  }
};

// Accept/Reject exchange
const updateExchangeStatus = async (req, res) => {
  try {
    const { exchangeId } = req.params;
    const { status } = req.body;

    if (!['Accepted', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const exchange = await Exchange.findById(exchangeId);
    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    // Only provider can accept/reject
    if (exchange.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    exchange.status = status;
    await exchange.save();

    // Award points when completed
    if (status === 'Completed') {
      const requester = await User.findById(exchange.requester);
      const provider = await User.findById(exchange.provider);
      
      requester.points += 10; // Points for learning
      provider.points += 10; // Points for teaching
      
      await requester.save();
      await provider.save();
    }

    const populatedExchange = await Exchange.findById(exchange._id)
      .populate('requester', 'username email role skills')
      .populate('provider', 'username email role skills');

    res.json({
      message: `Exchange ${status.toLowerCase()} successfully`,
      exchange: populatedExchange
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllExchanges,
  getMyExchanges,
  createExchange,
  updateExchangeStatus
};
