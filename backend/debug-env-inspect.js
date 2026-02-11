const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
const content = fs.readFileSync(envPath, 'utf8');

console.log('--- Raw Content (JSON stringified) ---');
console.log(JSON.stringify(content));
console.log('--- End Raw Content ---');

const lines = content.split(/\r?\n/);
lines.forEach((line, index) => {
    console.log(`Line ${index + 1}: "${line}" (Length: ${line.length})`);
    for (let i = 0; i < line.length; i++) {
        console.log(`  Char ${i}: ${line[i]} (${line.charCodeAt(i)})`);
    }
});
