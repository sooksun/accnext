const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 5000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const request = http.request(options, (response) => {
  if (response.statusCode === 200) {
    console.log('✅ Health check passed');
    process.exit(0);
  } else {
    console.log(`❌ Health check failed: ${response.statusCode}`);
    process.exit(1);
  }
});

request.on('error', (error) => {
  console.log(`❌ Health check error: ${error.message}`);
  process.exit(1);
});

request.on('timeout', () => {
  console.log('❌ Health check timeout');
  request.destroy();
  process.exit(1);
});

request.end(); 