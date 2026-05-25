const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const stringSimilarity = require('string-similarity');
const axios = require('axios');
const sharp = require('sharp');

const DATA_PATH = path.join(__dirname, '..', 'data', 'menuData.json');
const HTML_PATH = path.join(__dirname, 'page.html');
const BASE_URL = 'https://zagato.solus.studio/palazzo/';

const MAX_WIDTH = 600;
const MAX_HEIGHT = 600;
const JPEG_QUALITY = 78;

async function run() {
  const html = fs.readFileSync(HTML_PATH, 'utf8');
  const $ = cheerio.load(html);

  // Group items by category by traversing DOM
  const scrapedCategories = [];
  let currentCat = null;

  $('*').each((i, el) => {
    const $el = $(el);
    
    // Check if it's a category header
    if ($el.is('h3.tst-title--h')) {
      const catName = $el.find('span').text().trim() || $el.text().trim();
      currentCat = { name: catName, items: [] };
      scrapedCategories.push(currentCat);
    }
    
    // Check if it's an item
    if ($el.is('.tst-menu-book-item') && currentCat) {
      let name = $el.find('h5 span').text().trim();
      if (!name) name = $el.find('h5').text().trim();
      
      let desc = $el.find('.tst-text span').text().trim();
      if (!desc) desc = $el.find('.tst-text').text().trim();
      
      let priceText = $el.find('.tst-price span').text().trim();
      if (!priceText) priceText = $el.find('.tst-price').text().trim();
      const price = priceText.replace(/[^0-9]/g, '');

      const imgSrc = $el.find('img').attr('src');
      
      if (name && !imgSrc?.includes('logo.png')) {
        currentCat.items.push({ name, desc, price, imgSrc });
      }
    }
  });

  console.log(`Scraped ${scrapedCategories.length} categories.`);

  let menuData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const menuCategories = menuData.map(c => c.category);

  let addedCount = 0;
  let updatedImgCount = 0;

  // Flatten current menuData items
  const currentItemNames = [];
  menuData.forEach(cat => cat.items.forEach(item => currentItemNames.push(item.name)));

  for (const scrapedCat of scrapedCategories) {
    if (!scrapedCat.name || scrapedCat.items.length === 0) continue;

    // Find best matching category in menuData
    const catMatch = stringSimilarity.findBestMatch(scrapedCat.name, menuCategories);
    let targetCategory;
    if (catMatch.bestMatch.rating > 0.6) {
      let targetCatIndex = menuCategories.indexOf(catMatch.bestMatch.target);
      targetCategory = menuData[targetCatIndex];
    } else {
      // Create new category
      const newCatId = scrapedCat.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      targetCategory = {
        id: newCatId,
        category: scrapedCat.name,
        category_en: '',
        icon: 'drink',
        items: []
      };
      menuData.push(targetCategory);
      menuCategories.push(scrapedCat.name);
      console.log(`[New Category Created] -> ${scrapedCat.name}`);
    }

    for (const scrapedItem of scrapedCat.items) {
      const match = stringSimilarity.findBestMatch(scrapedItem.name, currentItemNames.length > 0 ? currentItemNames : ['dummy']);
      
      let targetItem = null;
      let isNew = false;

      if (match.bestMatch.rating > 0.7) {
        // Find it in menuData
        for (const c of menuData) {
          const found = c.items.find(i => i.name === match.bestMatch.target);
          if (found) targetItem = found;
        }
      } else {
        // It's a new item!
        targetItem = {
          name: scrapedItem.name,
          desc: scrapedItem.desc,
          price: scrapedItem.price,
          img: null
        };
        targetCategory.items.push(targetItem);
        currentItemNames.push(scrapedItem.name); // Add to known names
        isNew = true;
        addedCount++;
        console.log(`+ Added new item: "${scrapedItem.name}" to category "${targetCategory.category}"`);
      }

      // Download image if we don't have it or if it's new
      if ((isNew || !targetItem.img) && scrapedItem.imgSrc) {
        const imgUrl = scrapedItem.imgSrc.startsWith('http') ? scrapedItem.imgSrc : BASE_URL + scrapedItem.imgSrc;
        
        try {
          const response = await axios.get(imgUrl, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
          });

          const compressedBuffer = await sharp(Buffer.from(response.data))
            .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
            .toBuffer();

          targetItem.img = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
          updatedImgCount++;
          // console.log(`  -> Downloaded image for ${targetItem.name}`);
        } catch (err) {
          console.error(`  -> Failed image for ${targetItem.name}: ${err.message}`);
        }
      }
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(menuData, null, 2), 'utf8');
  console.log(`\nDone! Added ${addedCount} new items. Fetched ${updatedImgCount} images.`);
}

run().catch(console.error);
