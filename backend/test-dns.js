const dns = require('dns');

// Try using Google DNS
try {
    dns.setServers(['8.8.8.8']);
    console.log('Set DNS servers to 8.8.8.8');
} catch (e) {
    console.log('Could not set DNS servers:', e.message);
}

const hostname = '_mongodb._tcp.cluster0.309i1go.mongodb.net';

console.log(`Resolving SRV for ${hostname}...`);

dns.resolveSrv(hostname, (err, addresses) => {
    if (err) {
        console.error('DNS Resolution Error:', err);
    } else {
        console.log('SRV Records:', addresses);
    }
});
