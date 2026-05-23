import fs from 'fs/promises';
import path from 'path';
export const dynamic = 'force-dynamic';
import MenuClient from '@/components/MenuClient';

export default async function Home() {
  const DATA_PATH = path.join(process.cwd(), 'data', 'menuData.json');
  let menuData = [];

  try {
    const dataStr = await fs.readFile(DATA_PATH, 'utf8');
    menuData = JSON.parse(dataStr);
  } catch (error) {
    console.error('Failed to load menu data:', error);
  }

  return <MenuClient initialData={menuData} />;
}
