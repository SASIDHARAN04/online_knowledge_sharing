require('dotenv').config();
const mongoose = require('mongoose');

const cleanup = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      console.error('MONGO_URI is not defined in .env');
      return;
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    console.log('Checking indexes on "users" collection...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    const usernameIndexExists = indexes.some(idx => idx.name === 'username_1');

    if (usernameIndexExists) {
      console.log('Found "username_1" index. Dropping it...');
      await collection.dropIndex('username_1');
      console.log('Index "username_1" dropped successfully.');
    } else {
      console.log('Index "username_1" not found. Nothing to drop.');
    }

    console.log('Database cleanup complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanup();
