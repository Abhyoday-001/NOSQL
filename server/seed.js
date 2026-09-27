const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');
const bcrypt = require('bcrypt');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce-reco');

const seedData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password', salt);

    const users = [];
    for (let i = 1; i <= 10; i++) {
      users.push({
        name: `User ${i}`,
        email: `user${i}@test.com`,
        passwordHash
      });
    }
    const createdUsers = await User.insertMany(users);
    console.log('Users seeded');

    const categories = ['Electronics', 'Wearables', 'Home & Kitchen', 'Books'];
    const catToImg = {
      'Electronics': 'electronics,gadget',
      'Wearables': 'smartwatch',
      'Home & Kitchen': 'kitchenware',
      'Books': 'books'
    };
    
    const products = [];
    for (let i = 1; i <= 30; i++) {
      const cat = categories[i % 4];
      products.push({
        title: `Product ${i}`,
        category: cat,
        price: Math.floor(Math.random() * 100) + 10,
        stock: 50,
        tags: ['tag1', 'tag2'],
        imageUrl: `https://loremflickr.com/640/480/${catToImg[cat]}?lock=${i}`
      });
    }
    const createdProducts = await Product.insertMany(products);
    console.log('Products seeded');

    const orders = [];
    for (let i = 0; i < 40; i++) {
      const u = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const p1 = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const p2 = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      orders.push({
        userId: u._id,
        items: [
          { productId: p1._id, qty: 1, price: p1.price },
          { productId: p2._id, qty: 1, price: p2.price }
        ],
        totalAmount: p1.price + p2.price
      });
    }
    await Order.insertMany(orders);
    console.log('Orders seeded');

    const reviews = [];
    for (let i = 0; i < 60; i++) {
      const u = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const p = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      reviews.push({
        userId: u._id,
        productId: p._id,
        rating: Math.floor(Math.random() * 5) + 1,
        comment: 'Seed review'
      });
    }
    await Review.insertMany(reviews);
    
    // Update product ratings
    for (const p of createdProducts) {
      const pReviews = reviews.filter(r => r.productId.toString() === p._id.toString());
      if (pReviews.length > 0) {
        const avg = pReviews.reduce((acc, r) => acc + r.rating, 0) / pReviews.length;
        await Product.findByIdAndUpdate(p._id, { avgRating: avg });
      }
    }
    console.log('Reviews seeded');
    console.log('Seeding complete!');
  } catch (err) {
    console.error(err);
    throw err;
  }
};

if (require.main === module) {
  seedData().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedData;
