require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// Connect DB (if not testing)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  require('./jobs/recomputeRecommendations');
}

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;