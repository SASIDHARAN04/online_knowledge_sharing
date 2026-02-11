const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
let content = fs.readFileSync(envPath, 'utf8');

// Normalize newlines
content = content.replace(/\r\n/g, '\n');

const lines = content.split('\n');
const newLines = [];

lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return; // Skip empty lines

    // Check if this line looks like the MONGO_URI line
    if (trimmed.includes('mongodb+srv://') || trimmed.includes('MONGO')) {
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
            // Reconstruct with correct key
            // Join parts starting from index 1 to handle '=' in password/connection string
            const value = parts.slice(1).join('=').trim();
            newLines.push(`MONGO_URI=${value}`);
            console.log('Fixed MONGO_URI line.');
        } else {
            // If no equals sign, verify if it is the URI itself
            if (trimmed.startsWith('mongodb+srv://')) {
                newLines.push(`MONGO_URI=${trimmed}`);
                console.log('Fixed MONGO_URI line from raw URI.');
            } else {
                newLines.push(line); // Keep as is if unsure
            }
        }
    } else {
        newLines.push(line);
    }
});

const newContent = newLines.join('\n');
fs.writeFileSync(envPath, newContent, 'utf8');
console.log('Sanitized .env file.');
