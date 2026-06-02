const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMG_FOLDER = '/Users/hasantepe/Desktop/zagato tam işlenen';
const DATA_PATH = path.join(__dirname, '..', 'data', 'menuData.json');

// Food categories only (in display order) - skip drink/alcohol categories
const FOOD_CAT_IDS = [
  'baslangic',
  'mezeler',
  'arasicak',
  'burger-dana',
  'burger-tavuk',
  'makarna',
  'pizza',
  'et',
  'tavuk',
  'balik',
  'tatli',
];

async function run() {
  // 1. Get sorted image list
  const images = fs.readdirSync(IMG_FOLDER)
    .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort()  // DSC files sort naturally in order
    .map(f => path.join(IMG_FOLDER, f));

  console.log(`📷 ${images.length} görsel bulundu`);

  // 2. Load menu data
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  // 3. Collect food items in order
  const targets = [];
  for (const catId of FOOD_CAT_IDS) {
    const cat = data.find(c => c.id === catId);
    if (!cat) { console.log(`⚠ Category not found: ${catId}`); continue; }
    for (let i = 0; i < cat.items.length; i++) {
      targets.push({ cat, i, name: cat.items[i].name });
    }
  }

  console.log(`🍽  ${targets.length} menü ürünü (sırasıyla eşleştirilecek)`);
  console.log(`📌 ${Math.min(images.length, targets.length)} görsel uygulanacak\n`);

  // 4. Match & compress
  const count = Math.min(images.length, targets.length);
  for (let idx = 0; idx < count; idx++) {
    const { cat, i, name } = targets[idx];
    const imgPath = images[idx];

    try {
      const compressed = await sharp(imgPath)
        .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 78, mozjpeg: true })
        .toBuffer();

      const sizeMB = (fs.statSync(imgPath).size / 1024 / 1024).toFixed(1);
      const compKB = Math.round(compressed.length / 1024);

      cat.items[i].img = `data:image/jpeg;base64,${compressed.toString('base64')}`;
      console.log(`✓ [${idx + 1}/${count}] ${name} ← ${path.basename(imgPath)} (${sizeMB}MB → ${compKB}KB)`);
    } catch (err) {
      console.error(`✗ ${name}: ${err.message}`);
    }
  }

  // 5. Save
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n✅ ${count} görsel eklendi ve kaydedildi.`);
}

run().catch(console.error);
