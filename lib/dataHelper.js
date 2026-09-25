import fs from 'fs/promises';
import path from 'path';

const PERSISTENT_DIR = '/app/persistent';
const PERSISTENT_PATH = '/app/persistent/menuData.json';
const BACKUP_PATH = '/app/persistent/menuData.backup.json';
const BUNDLED_PATH = path.join(process.cwd(), 'data', 'menuData.json');

async function readJSON(p) {
  try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch { return null; }
}

// Write to a temp file then rename, so a reader never sees a half-written file.
async function writeJSONAtomic(p, data) {
  const tmp = `${p}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, p);
}

/**
 * Fills in `img` for items that have NO `img` key at all, using `source`
 * (matched by category id + item name). Items are only missing the key when
 * image-stripped data was saved by mistake; a deliberately removed photo is
 * stored as `img: null` and is left alone.
 * Returns the number of items restored.
 */
function restoreMissingImages(data, source) {
  if (!Array.isArray(data) || !Array.isArray(source)) return 0;
  const imgs = new Map();
  for (const cat of source) {
    for (const item of cat.items || []) {
      if (item && 'img' in item) imgs.set(`${cat.id}::${item.name}`, item.img);
    }
  }
  let restored = 0;
  for (const cat of data) {
    for (const item of cat.items || []) {
      if (!item || 'img' in item) continue;
      const key = `${cat.id}::${item.name}`;
      if (imgs.has(key)) {
        item.img = imgs.get(key);
        if (item.img) restored++;
      }
    }
  }
  return restored;
}

/**
 * Returns menu data using a SAFE MERGE strategy:
 * - If no persistent data exists → seed from bundled (first run)
 * - If persistent data exists → ALWAYS use it (admin edits are preserved)
 * - Only add brand-new categories from bundled that are missing in persistent
 * 
 * ⚠️ We deliberately NEVER overwrite the persistent volume from bundled.
 *    To force-reset, use the admin panel "Reset" function or delete the persistent file manually.
 */
export async function getMenuData() {
  const bundled = await readJSON(BUNDLED_PATH);
  if (!bundled) return [];

  const persistent = await readJSON(PERSISTENT_PATH);

  // First run — no persistent file yet: seed from bundled
  if (!persistent) {
    try {
      await fs.mkdir(PERSISTENT_DIR, { recursive: true });
      await writeJSONAtomic(PERSISTENT_PATH, bundled);
      console.log('✓ Persistent data seeded from bundled (first run)');
    } catch (e) {
      console.warn('⚠ Could not write persistent data:', e.message);
    }
    return bundled;
  }

  // Persistent exists — use it, but add any NEW categories from bundled
  const persistentIds = new Set(persistent.map(c => c.id));
  const newCats = bundled.filter(c => !persistentIds.has(c.id));

  // Recover photos lost by an image-stripped save (items without an `img` key)
  const restored = restoreMissingImages(persistent, bundled);

  if (newCats.length > 0 || restored > 0) {
    const merged = [...persistent, ...newCats];
    try {
      await writeJSONAtomic(PERSISTENT_PATH, merged);
      if (newCats.length) console.log(`✓ Added ${newCats.length} new categories from bundled`);
      if (restored) console.log(`✓ Restored ${restored} missing images from bundled`);
    } catch {}
    return merged;
  }

  return persistent;
}

/**
 * Saves menu data to the persistent volume.
 */
export async function saveMenuData(data) {
  // Never let a save drop photos: items sent without an `img` key keep
  // the image they currently have (or the bundled one as a last resort).
  const current = await readJSON(PERSISTENT_PATH);
  restoreMissingImages(data, current);
  restoreMissingImages(data, await readJSON(BUNDLED_PATH));

  try {
    await fs.mkdir(PERSISTENT_DIR, { recursive: true });
    if (current) await writeJSONAtomic(BACKUP_PATH, current);
    await writeJSONAtomic(PERSISTENT_PATH, data);
  } catch (e) {
    console.warn('⚠ Fallback to bundled path:', e.message);
    await fs.writeFile(BUNDLED_PATH, JSON.stringify(data, null, 2), 'utf8');
  }
}
