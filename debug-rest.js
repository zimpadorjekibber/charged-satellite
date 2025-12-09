const https = require('https');

const PROJECT_ID = "tashizom";
const COLLECTION = "debug_tests";
// Using a random ID for the document
const DOC_ID = "test_" + Date.now();
const API_KEY = "AIzaSyCW1Vb_w8tAqbCNlbYR2WHZLdqLYWs-dvY";

const data = JSON.stringify({
    fields: {
        message: { stringValue: "Hello from REST API" },
        timestamp: { stringValue: new Date().toISOString() }
    }
});

const options = {
    hostname: 'firestore.googleapis.com',
    port: 443,
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}?documentId=${DOC_ID}&key=${API_KEY}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('📡 Testing connectivity via REST API...');
console.log(`Target: https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
    console.log(`\n✅ Response Status: ${res.statusCode}`);

    let body = '';
    res.on('data', (d) => {
        body += d;
    });

    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Success! Document written via REST.');
        } else {
            console.log('❌ Failed with response:', body);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Network Error:', error.message);
    if (error.code === 'ETIMEDOUT') {
        console.error('⚠️  Connection Timed Out - Firewall issue?');
    } else if (error.code === 'ENOTFOUND') {
        console.error('⚠️  DNS Error - Could not resolve host.');
    }
});

req.write(data);
req.end();
