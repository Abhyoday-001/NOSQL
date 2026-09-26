const Review = require('../models/Review');
const Product = require('../models/Product');

exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    const review = await Review.create({
      userId: req.user._id,
      productId,
      rating,
      comment
    });
    // Update product avg rating
    const reviews = await Review.find({ productId });
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { avgRating: avg });
    res.status(201).json(review);
  } catch (error) { next(error); }
};