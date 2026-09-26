require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const startAll = async () => {
  console.log('Starting MongoDB Memory Server...');
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  process.env.MONGO_URI = mongoUri;
  console.log(`Memory Server started at ${mongoUri}`);
  
  // Wait for connections inside other files to pick this up, but seed.js explicitly requires mongoose so we just call it.
  const seedData = require('./seed');
  console.log('Running Seed Data...');
  await seedData();
  
  const runJob = require('./jobs/recomputeRecommendations');
  console.log('Running initial recommendations job...');
  await runJob();
  
  console.log('Starting API Server...');
  // Require index.js to start the server. 
  // connectDB in index.js will use the new process.env.MONGO_URI
  require('./index');
};

startAll().catch(err => {
  console.error('Failed to start up everything:', err);
  process.exit(1);
});
