require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Temporarily set DNS servers for this test to bypass a local DNS proxy
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  console.log('Using DNS servers (test):', dns.getServers());
} catch (e) {
  console.warn('Could not set DNS servers for test:', e.message);
}

const uri = process.env.MONGO_URI;
console.log('Testing MONGO_URI:', uri ? uri.replace(/:(.*)@/, ':*****@') : uri);

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully (test)');
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB connection error (test):', err);
    process.exit(1);
  });
