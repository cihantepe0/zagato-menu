const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const stringSimilarity = require('string-similarity');
const axios = require('axios');
const sharp = require('sharp'); // Uses the main repo sharp or one available globally

const DATA_PATH = path.join(__dirname, '..', 'data', 'menuData.json');
const HTML_PATH = path.join(__dirname, 'page.html');
const BASE_URL = 'https://zagato.solus.studio/palazzo/';

const MAX_WIDTH = 600;
const MAX_HEIGHT = 600;
const JPEG_QUALITY = 78;

async function run() {
  const html = fs.readFileSync(HTML_PATH, 'utf8');
  const $ = cheerio.load(html);

  const extractedItems = [];

  $('.tst-menu-book-item').each((i, el) => {
    let name = $(el).find('h5 span').text().trim();
    if (!name) name = $(el).find('h5').text().trim();
    
    const imgSrc = $(el).find('img').attr('src');
    
    if (name && imgSrc && !imgSrc.includes('logo.png')) {
      extractedItems.push({ name, imgSrc });
    }
  });

  console.log(`Extracted ${extractedItems.length} items from HTML.`);

  const menuData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const allCurrentItems = [];
  
  menuData.forEach((category, cIdx) => {
    if (category.items) {
      category.items.forEach((item, iIdx) => {
        allCurrentItems.push({
          name: item.name,
          cIdx,
          iIdx,
          hasImg: !!item.img
        });
      });
    }
  });

  const itemNames = allCurrentItems.map(i => i.name);
  let updatedCount = 0;

  for (const extracted of extractedItems) {
    if (!extracted.imgSrc) continue;

    const match = stringSimilarity.findBestMatch(extracted.name, itemNames);
    const bestMatch = match.bestMatch;

    if (bestMatch.rating > 0.6) {
      const targetItemInfo = allCurrentItems.find(i => i.name === bestMatch.target);
      const category = menuData[targetItemInfo.cIdx];
      const item = category.items[targetItemInfo.iIdx];

      // Only update if image is missing or user requested to sync missing content
      // We'll update if there's an image. If user wants all to be from website, we overwrite.
      // But let's check if the extracted image actually exists
      const imgUrl = extracted.imgSrc.startsWith('http') ? extracted.imgSrc : BASE_URL + extracted.imgSrc;

      console.log(`Matched extracted "${extracted.name}" with menu "${item.name}" (Rating: ${bestMatch.rating.toFixed(2)})`);

      try {
        const response = await axios.get(imgUrl, {
          responseType: 'arraybuffer',
          // sometimes sites block default user agents
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
          }
        });

        const inputBuffer = Buffer.from(response.data);
        
        const compressedBuffer = await sharp(inputBuffer)
          .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
          .toBuffer();

        const dataUrl = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        
        item.img = dataUrl;
        updatedCount++;
        console.log(` -> Downloaded and compressed image for ${item.name}`);

      } catch (err) {
        console.error(` -> Failed to fetch/compress image for ${item.name}: ${err.message}`);
      }
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(menuData, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} items with images.`);
}

run().catch(console.error);
