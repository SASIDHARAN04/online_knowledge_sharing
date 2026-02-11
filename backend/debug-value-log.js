require('dotenv').config();
const fs = require('fs');
const uri = process.env.MONGO_URI;

const info = {
    type: typeof uri,
    value: uri,
    codes: uri ? uri.split('').map(c => c.charCodeAt(0)) : [],
    length: uri ? uri.length : 0
};

fs.writeFileSync('debug-value.json', JSON.stringify(info, null, 2));
console.log('Debug info written to debug-value.json');
