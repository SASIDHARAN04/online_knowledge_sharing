require('dotenv').config();

const uri = process.env.MONGO_URI;
console.log('--- MONGO_URI Value Inspection ---');
console.log('Value type:', typeof uri);
if (typeof uri === 'string') {
    console.log('Value length:', uri.length);
    console.log('Value (JSON):', JSON.stringify(uri));
    console.log('Starts with "mongodb+srv://":', uri.startsWith('mongodb+srv://'));
    console.log('First 20 chars:', uri.substring(0, 20));
    console.log('First 20 codes:', uri.split('').slice(0, 20).map(c => c.charCodeAt(0)));
} else {
    console.log('Value is undefined or not a string.');
}
