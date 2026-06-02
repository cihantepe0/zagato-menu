import fs from 'fs/promises';
import path from 'path';
export const dynamic = 'force-dynamic';
import MenuClient from '@/components/MenuClient';

async function loadJSON(persistentPath, bundledPath) {
  try { return JSON.parse(await fs.readFile(persistentPath, 'utf8')); } catch {}
  try { return JSON.parse(await fs.readFile(bundledPath, 'utf8')); } catch {}
  return null;
}

export default async function Home() {
  const [menuData, fixMenuData] = await Promise.all([
    loadJSON('/app/persistent/menuData.json', path.join(process.cwd(), 'data', 'menuData.json')),
    loadJSON('/app/persistent/fixMenu.json', path.join(process.cwd(), 'data', 'fixMenu.json')),
  ]);

  // Strip base64 images from SSR payload — client fetches them separately
  // This prevents a ~2MB hydration payload that breaks React event binding
  const lightData = (menuData || []).map(cat => ({
    ...cat,
    items: cat.items.map(({ img, ...rest }) => rest),
  }));

  return <MenuClient initialData={lightData} fixMenuData={fixMenuData} />;
}
