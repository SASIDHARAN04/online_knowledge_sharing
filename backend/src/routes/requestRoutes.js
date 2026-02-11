const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticate } = require('../middlewares/auth');

// Protected routes
router.get('/', authenticate, requestController.getAllRequests);
router.get('/my-requests', authenticate, requestController.getMyRequests);
router.post('/', authenticate, requestController.createRequest);
router.patch('/:requestId/status', authenticate, requestController.updateRequestStatus);

module.exports = router;
