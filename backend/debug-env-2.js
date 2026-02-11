const dotenv = require('dotenv');

const result = dotenv.config({ debug: true });

if (result.error) {
    console.error('dotenv error:', result.error);
}

if (result.parsed) {
    console.log('Parsed keys:', Object.keys(result.parsed));
} else {
    console.log('No parsed result.');
}

console.log('Environment variables matching "MONGO":');
Object.keys(process.env).forEach(key => {
    if (key.includes('MONGO')) {
        console.log(`Key: "${key}" Value Length: ${process.env[key].length}`);
    }
});
