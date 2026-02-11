require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Set DNS servers to Google's public DNS to resolve MongoDB SRV records
try {
    dns.setServers(['8.8.8.8']);
} catch (error) {
    console.error('Could not set DNS servers:', error);
}

const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
