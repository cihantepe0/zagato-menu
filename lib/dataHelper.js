import fs from 'fs/promises';
import path from 'path';

const PERSISTENT_DIR = '/app/persistent';
const PERSISTENT_PATH = '/app/persistent/menuData.json';
const PERSISTENT_VER_PATH = '/app/persistent/dataVersion.json';
const BUNDLED_PATH = path.join(process.cwd(), 'data', 'menuData.json');
const BUNDLED_VER_PATH = path.join(process.cwd(), 'data', 'dataVersion.json');

async function readJSON(p) {
  try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch { return null; }
}

/**
 * Returns menu data. Version-based force reset logic:
 * - If bundled version > persistent version → overwrite persistent with bundled
 * - Otherwise do a smart merge (add new categories/items from bundled)
 */
export async function getMenuData() {
  const bundled = await readJSON(BUNDLED_PATH);
  if (!bundled) return [];

  const bundledVer = (await readJSON(BUNDLED_VER_PATH))?.v ?? 1;
  const persistentVer = (await readJSON(PERSISTENT_VER_PATH))?.v ?? 0;

  let persistent = await readJSON(PERSISTENT_PATH);

  // Force reset if bundled has a newer version
  if (!persistent || bundledVer > persistentVer) {
    try {
      await fs.mkdir(PERSISTENT_DIR, { recursive: true });
      await fs.writeFile(PERSISTENT_PATH, JSON.stringify(bundled, null, 2), 'utf8');
      await fs.writeFile(PERSISTENT_VER_PATH, JSON.stringify({ v: bundledVer }), 'utf8');
      console.log(`✓ Persistent data reset to bundled version ${bundledVer}`);
    } catch (e) {
      console.warn('⚠ Could not write persistent data:', e.message);
    }
    return bundled;
  }

  // Same version — smart merge (add new categories/items from bundled, preserve admin changes)
  const persistentIds = new Set(persistent.map(c => c.id));
  const newCats = bundled.filter(c => !persistentIds.has(c.id));

  if (newCats.length > 0) {
    const merged = [...persistent, ...newCats];
    try {
      await fs.writeFile(PERSISTENT_PATH, JSON.stringify(merged, null, 2), 'utf8');
    } catch {}
    return merged;
  }

  return persistent;
}

/**
 * Saves menu data to the persistent volume (preserves version).
 */
export async function saveMenuData(data) {
  try {
    await fs.mkdir(PERSISTENT_DIR, { recursive: true });
    await fs.writeFile(PERSISTENT_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.warn('⚠ Fallback to bundled path:', e.message);
    await fs.writeFile(BUNDLED_PATH, JSON.stringify(data, null, 2), 'utf8');
  }
}
