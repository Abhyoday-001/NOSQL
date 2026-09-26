const Order = require('../models/Order');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, totalAmount } = req.body;
    const order = await Order.create({
      userId: req.user._id,
      items,
      totalAmount
    });
    res.status(201).json(order);
  } catch (error) { next(error); }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate('items.productId');
    res.json(orders);
  } catch (error) { next(error); }
};