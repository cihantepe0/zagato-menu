import fs from 'fs/promises';
import path from 'path';

const PERSISTENT_PATH = '/app/persistent/menuData.json';
const BUNDLED_PATH = path.join(process.cwd(), 'data', 'menuData.json');

/**
 * Reads menu data. Smart merge logic:
 * - If persistent exists but bundled has NEW categories → merge them in
 * - If persistent doesn't exist → initialize from bundled
 * - Admin changes to existing items are always preserved
 */
export async function getMenuData() {
  let bundled;
  try {
    const bundledStr = await fs.readFile(BUNDLED_PATH, 'utf8');
    bundled = JSON.parse(bundledStr);
  } catch {
    return [];
  }

  try {
    await fs.access(PERSISTENT_PATH);
    const persistentStr = await fs.readFile(PERSISTENT_PATH, 'utf8');
    const persistent = JSON.parse(persistentStr);

    // Find new categories that exist in bundled but not in persistent
    const persistentIds = new Set(persistent.map(c => c.id));
    const newCats = bundled.filter(c => !persistentIds.has(c.id));

    if (newCats.length > 0) {
      // Also check for new items within existing categories
      const merged = persistent.map(pCat => {
        const bCat = bundled.find(b => b.id === pCat.id);
        if (!bCat) return pCat;
        const persistentItemNames = new Set(pCat.items.map(i => i.name));
        const newItems = bCat.items.filter(i => !persistentItemNames.has(i.name));
        if (newItems.length > 0) {
          return { ...pCat, items: [...pCat.items, ...newItems] };
        }
        return pCat;
      });

      const final = [...merged, ...newCats];
      await fs.mkdir('/app/persistent', { recursive: true });
      await fs.writeFile(PERSISTENT_PATH, JSON.stringify(final, null, 2), 'utf8');
      console.log(`✓ Merged ${newCats.length} new categories into persistent data`);
      return final;
    }

    return persistent;
  } catch {
    // Persistent doesn't exist — initialize from bundled
    try {
      await fs.mkdir('/app/persistent', { recursive: true });
      const bundledStr = await fs.readFile(BUNDLED_PATH, 'utf8');
      await fs.writeFile(PERSISTENT_PATH, bundledStr, 'utf8');
      console.log('✓ Initialized persistent data from bundled JSON');
    } catch (e) {
      console.warn('⚠ Could not write persistent data:', e.message);
    }
    return bundled;
  }
}

/**
 * Saves menu data to the persistent volume.
 */
export async function saveMenuData(data) {
  try {
    await fs.mkdir('/app/persistent', { recursive: true });
    await fs.writeFile(PERSISTENT_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    // Fallback: write to bundled path
    console.warn('⚠ Could not write to persistent, falling back to bundled path:', e.message);
    await fs.writeFile(BUNDLED_PATH, JSON.stringify(data, null, 2), 'utf8');
  }
}
