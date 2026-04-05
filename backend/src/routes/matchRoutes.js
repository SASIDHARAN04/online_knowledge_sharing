const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authenticate } = require('../middlewares/auth');

// Protected routes
router.get('/find', authenticate, matchController.findMatches);

module.exports = router;
