const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');

exports.getProducts = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    let query = {};
    if (q) query.$text = { $search: q };
    if (category) query.category = category;
    const products = await Product.find(query);
    res.json(products);
  } catch (error) { next(error); }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) { res.status(404); throw new Error('Product not found'); }
    res.json(product);
  } catch (error) { next(error); }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) { next(error); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) { next(error); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) { next(error); }
};

exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.id }).populate('userId', 'name');
    res.json(reviews);
  } catch (error) { next(error); }
};

exports.getTopRatedPerCategory = async (req, res, next) => {
  try {
    const result = await Product.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'productId',
          as: 'reviewsData'
        }
      },
      { $unwind: { path: '$reviewsData', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { category: '$category', productId: '$_id' },
          productTitle: { $first: '$title' },
          avgRating: { $avg: '$reviewsData.rating' }
        }
      },
      { $match: { avgRating: { $ne: null } } },
      { $sort: { avgRating: -1 } },
      {
        $group: {
          _id: '$_id.category',
          topProduct: { $first: '$productTitle' },
          avgRating: { $first: '$avgRating' },
          productId: { $first: '$_id.productId' }
        }
      }
    ]);
    res.json(result);
  } catch (error) { next(error); }
};

exports.getFrequentlyBoughtTogether = async (req, res, next) => {
  try {
    const result = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', coPurchaseCount: { $sum: 1 } } },
      { $sort: { coPurchaseCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { _id: 1, coPurchaseCount: 1, title: '$product.title', price: '$product.price' } }
    ]);
    res.json(result);
  } catch (error) { next(error); }
};