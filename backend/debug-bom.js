const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
const buffer = fs.readFileSync(envPath);

console.log('File size:', buffer.length);
console.log('First 6 bytes (hex):', buffer.slice(0, 6).toString('hex'));

if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    console.log('UTF-8 BOM detected.');
} else if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
    console.log('UTF-16 LE BOM detected.');
} else if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
    console.log('UTF-16 BE BOM detected.');
} else {
    console.log('No BOM detected.');
    console.log('First byte:', buffer[0]);
}

const content = fs.readFileSync(envPath, 'utf8');
console.log('Is content matching "MONGO_URI"?', content.includes('MONGO_URI'));
const lines = content.split(/\r?\n/);
lines.forEach((line, index) => {
    if (line.includes('MONGO_URI')) {
        console.log(`Line ${index + 1} contains MONGO_URI`);
        console.log(`Line starts with: ${line.substring(0, 20)}`);
    }
});
