import fs from 'fs/promises';
import path from 'path';

const PERSISTENT_DIR = '/app/persistent';
const PERSISTENT_PATH = '/app/persistent/menuData.json';
const BUNDLED_PATH = path.join(process.cwd(), 'data', 'menuData.json');

async function readJSON(p) {
  try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch { return null; }
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
      await fs.writeFile(PERSISTENT_PATH, JSON.stringify(bundled, null, 2), 'utf8');
      console.log('✓ Persistent data seeded from bundled (first run)');
    } catch (e) {
      console.warn('⚠ Could not write persistent data:', e.message);
    }
    return bundled;
  }

  // Persistent exists — use it, but add any NEW categories from bundled
  const persistentIds = new Set(persistent.map(c => c.id));
  const newCats = bundled.filter(c => !persistentIds.has(c.id));

  if (newCats.length > 0) {
    const merged = [...persistent, ...newCats];
    try {
      await fs.writeFile(PERSISTENT_PATH, JSON.stringify(merged, null, 2), 'utf8');
      console.log(`✓ Added ${newCats.length} new categories from bundled`);
    } catch {}
    return merged;
  }

  return persistent;
}

/**
 * Saves menu data to the persistent volume.
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
