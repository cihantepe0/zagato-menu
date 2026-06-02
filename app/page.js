import fs from 'fs/promises';
import path from 'path';
export const dynamic = 'force-dynamic';
import MenuClient from '@/components/MenuClient';

async function loadJSON(persistentPath, bundledPath) {
  // Try persistent volume first
  try { return JSON.parse(await fs.readFile(persistentPath, 'utf8')); } catch {}
  // Fall back to bundled
  try { return JSON.parse(await fs.readFile(bundledPath, 'utf8')); } catch {}
  return null;
}

export default async function Home() {
  const [menuData, fixMenuData] = await Promise.all([
    loadJSON('/app/persistent/menuData.json', path.join(process.cwd(), 'data', 'menuData.json')),
    loadJSON('/app/persistent/fixMenu.json', path.join(process.cwd(), 'data', 'fixMenu.json')),
  ]);

  return <MenuClient initialData={menuData || []} fixMenuData={fixMenuData} />;
}
