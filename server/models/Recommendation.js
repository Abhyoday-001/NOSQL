const mongoose = require('mongoose');
const recommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  recommended: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    score: { type: Number, required: true },
    type: { type: String, required: true }
  }],
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);