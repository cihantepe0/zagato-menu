const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Try to bypass 403 blocks
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
  });

  console.log('Navigating to https://zagato.solus.studio...');
  let apiData = null;
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('.json') || url.includes('/api/')) {
      try {
        const text = await response.text();
        console.log(`Found potential JSON data at ${url}`);
        fs.writeFileSync('response.log', url + '\n' + text.substring(0, 500) + '\n\n', { flag: 'a' });
      } catch (e) {}
    }
  });

  await page.goto('https://zagato.solus.studio', { waitUntil: 'networkidle2' });
  
  const content = await page.content();
  fs.writeFileSync('page.html', content);
  console.log('Saved page.html');
  
  await browser.close();
})();
