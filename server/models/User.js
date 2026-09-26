const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  addresses: [{ type: String }],
  viewedProducts: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], validate: [arrayLimit, '{PATH} exceeds the limit of 50'] },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

function arrayLimit(val) { return val.length <= 50; }

// Cap viewed products on save
userSchema.pre('save', function() {
  if (this.viewedProducts && this.viewedProducts.length > 50) {
    this.viewedProducts = this.viewedProducts.slice(-50);
  }
});

module.exports = mongoose.model('User', userSchema);