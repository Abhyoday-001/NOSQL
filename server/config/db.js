const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce-reco';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (!process.env.MONGO_URI) {
      try {
        memoryServer = await MongoMemoryServer.create();
        process.env.MONGO_URI = memoryServer.getUri();
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`);
        return;
      } catch (memoryError) {
        console.error(`Memory MongoDB fallback failed: ${memoryError.message}`);
      }
    }

    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;