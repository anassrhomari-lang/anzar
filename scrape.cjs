const https = require('https');

const options = {
  hostname: 'www.healio.com',
  port: 443,
  path: '/news/cardiology',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (d) => {
    data += d;
  });
  res.on('end', () => {
    const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/gi;
    let match;
    const urls = new Set();
    while ((match = imgRegex.exec(data)) !== null) {
      if (match[1].includes('healio.com') || match[1].includes('slntio.com') || match[1].includes(' Healio ')) {
          urls.add(match[1]);
      } else if (match[1].startsWith('/')) {
         urls.add('https://www.healio.com' + match[1]);
      } else {
         urls.add(match[1]);
      }
    }
    console.log(Array.from(urls).slice(0, 20));
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
