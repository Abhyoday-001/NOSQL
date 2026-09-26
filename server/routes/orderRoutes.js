const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.route('/').post(protect, createOrder);
router.route('/:userId').get(protect, getUserOrders);

module.exports = router;