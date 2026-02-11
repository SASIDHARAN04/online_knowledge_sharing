const express = require('express');
const router = express.Router();
const exchangeController = require('../controllers/exchangeController');
const { authenticate } = require('../middlewares/auth');

// Protected routes
router.get('/', authenticate, exchangeController.getAllExchanges);
router.get('/my-exchanges', authenticate, exchangeController.getMyExchanges);
router.post('/', authenticate, exchangeController.createExchange);
router.patch('/:exchangeId/status', authenticate, exchangeController.updateExchangeStatus);

module.exports = router;
