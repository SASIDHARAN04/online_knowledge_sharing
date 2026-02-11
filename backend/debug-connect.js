require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const fs = require('fs');

// Set DNS servers to Google's public DNS
try {
    dns.setServers(['8.8.8.8']);
    console.log('DNS servers set to 8.8.8.8');
} catch (error) {
    console.error('Could not set DNS servers:', error);
}

const MONGO_URI = process.env.MONGO_URI;

console.log('Attempting to connect to MongoDB...');
// console.log('URI:', MONGO_URI); // Don't log URI with password

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Connection Failed!');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        console.error('Error Code:', err.code);
        console.error('Error CodeName:', err.codeName);
        if (err.errorResponse) {
            console.error('Error Response:', JSON.stringify(err.errorResponse, null, 2));
        }

        const logContent = `
Time: ${new Date().toISOString()}
Error Name: ${err.name}
Error Message: ${err.message}
Error Code: ${err.code}
Error CodeName: ${err.codeName}
Full Error: ${JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}
`;
        fs.writeFileSync('connection-error.log', logContent);
        console.log('Error details written to connection-error.log');
        process.exit(1);
    });
