const request = require('supertest');
const mongoose = require('mongoose');
const { expect } = require('chai');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const User = require('../models/User');

let mongoServer;
let token;
let user;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Setup user and token
  const res = await request(app)
    .post('/api/users/register')
    .send({ name: 'Test', email: 'test@test.com', password: 'password' });
  if (res.status !== 201) console.error('Reg failed:', res.body);
  token = res.body.token;
  user = res.body;
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Product API', () => {
  let prodId;
  it('should create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Prod', category: 'Books', price: 10, stock: 100 });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('_id');
    prodId = res.body._id;
  });

  it('should get products with filter', async () => {
    const res = await request(app).get('/api/products?category=Books');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.equal(1);
  });

  it('should do text search', async () => {
    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Magic Keyboard', tags: ['apple', 'tech'], category: 'Electronics', price: 100 });
    
    // Ensure index is built in mongod-memory-server
    await Product.syncIndexes();

    const res = await request(app).get('/api/products?q=Magic');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body[0].title).to.equal('Magic Keyboard');
  });

  it('should update stock', async () => {
    const res = await request(app)
      .put(`/api/products/${prodId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: 50 });
    expect(res.status).to.equal(200);
    expect(res.body.stock).to.equal(50);
  });

  it('should get top rated products per category', async () => {
    await Review.create({ userId: user._id, productId: prodId, rating: 5, comment: 'Great' });
    const res = await request(app).get('/api/products/top-rated');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('should get frequently bought together', async () => {
    await Order.create({
      userId: user._id,
      items: [
        { productId: prodId, qty: 1, price: 10 },
        { productId: prodId, qty: 1, price: 10 }
      ],
      totalAmount: 20
    });
    const res = await request(app).get('/api/products/frequently-bought');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('should delete a product', async () => {
    const res = await request(app)
      .delete(`/api/products/${prodId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
  });
});