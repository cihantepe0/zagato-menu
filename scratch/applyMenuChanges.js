const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'menuData.json');
let data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// ── 1. REMOVE ENTIRE Salatalar category ──────────────────────────
data = data.filter(c => c.id !== 'salata');
console.log('✓ Salatalar kategorisi silindi');

// ── 2. REMOVE specific items by name (fuzzy) ─────────────────────
const REMOVE_ITEMS = [
  // Başlangıçlar - scraped wrong items
  'Mozerella Fruit Caprice', 'Dana Carpaccio', 'İthal Peynir Tabağı',
  'Yöresel Peynir Tabağı',
  // Ciğer/Kokoreç
  'Tütsülenmiş Ciğer', 'Ciğer', 'Ciger',
  'İçlenen Kokoreç', 'İşlenen Kokoreç', 'Atom Kokoreç',
  // Ispanak
  'Ispanak Muskası', 'Ispanak Morbası',
  // Wraplar
  'Beef Wrap', 'Wrap',
  // Makarna extras (scraped from old site)
  'Rigatoni & Straciatella', 'Papardelle Alfredo', 'Mantı', 'Risotto Porchini',
  // Et Yemekleri extras (scraped from old site - Ana Yemekler)
  'Zagato Köfte', 'Lokum Bonfile', 'Kuzu İncik', 'Kütük Bonfile',
  'Izgara Körpe Piliç', 'Ortaklar Çöp Şiş', 'Adana Kebap',
  'Kanat Şiş', 'Tavuk Kalça Şiş', 'Tavuk Schnitzel', 'Surf & Turf', 'Günün Balığı',
  // Combo/Sharing from old site
  'Zagato Combo Tabağı', 'Sharing',
];

const removedNames = new Set(REMOVE_ITEMS.map(n => n.toLowerCase()));

data = data.map(cat => ({
  ...cat,
  items: cat.items.filter(item => {
    const name = (item.name || '').toLowerCase();
    const shouldRemove = REMOVE_ITEMS.some(r => name.includes(r.toLowerCase()));
    if (shouldRemove) console.log(`  ✗ Silindi: ${item.name} (${cat.category})`);
    return !shouldRemove;
  })
}));

// ── 3. ADD PRICES per category ────────────────────────────────────
const catPrices = {
  'burger-dana': {
    "Zagato Jack Daniel's Smoke Burger": "850",
    "Cheese Burger": "690",
    "Garlic Mushroom & Cheese Burger": "720",
    "Bacon Cheese Burger": "750",
  },
  'burger-tavuk': {
    "Çıtır Chicken Burger": "650",
    "Chicken Cheese Burger": "670",
    "Garlic Mushroom & Cheese Burger": "690",
  },
  'makarna': {
    "Frutti di Mare Fettuccine": "790",
    "Rigatoni Bolognese": "690",
    "Fettuccine Bonfile": "790",
    "Fettuccine Alfredo": "690",
    "Mantarlı Risotto": "790",
  },
  'pizza': {
    "Pizza Margherita": "690",
    "Pizza Romana": "750",
    "Pizza Frutti di Mare": "890",
    "Pizza Alaturca": "790",
    "Pizza Kokoreç": "",
  },
  'et': {
    "Kuzu Pirzola": "1650",
    "Antrikot Izgara": "1250",
    "Black Pepper Antrikot": "1290",
    "Rokfor Soslu Bonfile": "1590",
    "Trüflü Mantar Soslu Bonfile": "1590",
    "Zagato Barbekü Tabağı (2 Kişilik)": "2850",
  },
  'tavuk': {
    "Alpino Kebap": "790",
    "Mantar Soslu Tavuk": "750",
  },
  'balik': {
    "Pazıya Sarılı Somon": "950",
    "Levrek Izgara": "900",
    "Chili Fish": "900",
  },
  'tatli': {
    "San Sebastian Cheesecake": "390",
    "Brownie": "390",
    "Sufle": "390",
    "Meyve Tabağı": "1500",
  },
};

data = data.map(cat => {
  const prices = catPrices[cat.id];
  if (!prices) return cat;
  return {
    ...cat,
    items: cat.items.map(item => {
      const p = prices[item.name];
      if (p !== undefined && item.price !== p) {
        console.log(`  ₺ Fiyat: ${item.name} → ${p}₺`);
        return { ...item, price: p };
      }
      return item;
    })
  };
});

// ── 4. ADD NEW ITEMS ───────────────────────────────────────────────
// Güveçte Kokoreç → Ara Sıcaklar
const arasicakCat = data.find(c => c.id === 'arasicak');
if (arasicakCat) {
  const alreadyExists = arasicakCat.items.some(i => i.name.includes('Güveçte Kokoreç'));
  if (!alreadyExists) {
    arasicakCat.items.push({
      name: "Güveçte Kokoreç",
      name_en: "Kokoreç Casserole",
      desc: "Kokoreç, baharatı, jalapeño, kapuçi biber",
      desc_en: "Kokoreç, spices, jalapeño, cubanelle pepper",
      price: "",
      img: null
    });
    console.log('✓ Güveçte Kokoreç → Ara Sıcaklar eklendi');
  }
}

// Pizza Kokoreç → Pizzatesler
const pizzaCat = data.find(c => c.id === 'pizza');
if (pizzaCat) {
  const alreadyExists = pizzaCat.items.some(i => i.name.includes('Pizza Kokoreç'));
  if (!alreadyExists) {
    pizzaCat.items.push({
      name: "Pizza Kokoreç",
      name_en: "Pizza Kokoreç",
      desc: "Mozarella peynir, domates sos, kokoreç",
      desc_en: "Mozzarella cheese, tomato sauce, kokoreç",
      price: "",
      img: null
    });
    console.log('✓ Pizza Kokoreç → Pizzatesler eklendi');
  }
}

// ── 5. SAVE ───────────────────────────────────────────────────────
fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
console.log('\n✅ menuData.json güncellendi!');

// Summary
console.log('\n── Özet ──');
data.slice(0, 12).forEach(cat => {
  console.log(`${cat.category} (${cat.items.length} ürün)`);
});
