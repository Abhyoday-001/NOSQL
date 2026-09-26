const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getProductReviews, getFrequentlyBoughtTogether, getTopRatedPerCategory } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/frequently-bought', getFrequentlyBoughtTogether);
router.get('/top-rated', getTopRatedPerCategory);

router.route('/')
  .get(getProducts)
  .post(protect, createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

router.get('/:id/reviews', getProductReviews);

module.exports = router;