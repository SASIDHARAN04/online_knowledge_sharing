const fs = require('fs');
const path = require('path');

console.log('Current working directory:', process.cwd());
const envPath = path.resolve(process.cwd(), '.env');
console.log('Expected .env path:', envPath);

if (fs.existsSync(envPath)) {
    console.log('.env file exists.');
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('.env content length:', content.length);
    // console.log('.env content:', content); // Don't log content to avoid leaking secrets
} else {
    console.error('.env file does NOT exist.');
}

const dotenvResult = require('dotenv').config();

if (dotenvResult.error) {
    console.error('dotenv error:', dotenvResult.error);
} else {
    console.log('dotenv parsed:', Object.keys(dotenvResult.parsed));
}

console.log('MONGO_URI from process.env:', process.env.MONGO_URI);
