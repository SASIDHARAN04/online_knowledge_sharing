const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split(/\r?\n/);

lines.forEach((line, index) => {
    if (line.includes('MONGO_URI')) {
        console.log(`Line ${index + 1} Raw: "${line}"`);
        const indexOfEqual = line.indexOf('=');
        console.log(`Index of '=': ${indexOfEqual}`);
        if (indexOfEqual === -1) {
            console.error('ERROR: Missing "=" in MONGO_URI line.');
        } else {
            const key = line.substring(0, indexOfEqual).trim();
            const value = line.substring(indexOfEqual + 1).trim();
            console.log(`Key: "${key}"`);
            console.log(`Value starts with: "${value.substring(0, 10)}..."`);
            if (key !== 'MONGO_URI') {
                console.error(`ERROR: Key is "${key}", expected "MONGO_URI".`);
            }
        }
    }
});
