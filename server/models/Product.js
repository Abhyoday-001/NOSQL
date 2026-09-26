const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String },
  tags: [{ type: String }],
  price: { type: Number, required: true },
  attributes: { type: mongoose.Schema.Types.Mixed },
  avgRating: { type: Number, default: 0 },
  stock: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.index({ category: 1, price: -1 });
productSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);