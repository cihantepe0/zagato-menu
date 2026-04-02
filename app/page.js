import fs from 'fs/promises';
import path from 'path';
export const dynamic = 'force-dynamic';
import MenuClient from '@/components/MenuClient';
import styles from '@/app/page.module.css';

export default async function Home() {
  const DATA_PATH = path.join(process.cwd(), 'data', 'menuData.json');
  let menuData = [];

  try {
    const dataStr = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(dataStr);
    
    // Safety fix: Ensure all background images use .webp extension
    menuData = data.map(section => ({
      ...section,
      backgroundImage: (section.backgroundImage || '').replace('.png', '.webp')
    }));
  } catch (error) {
    console.error('Failed to load menu data:', error);
  }

  return (
    <main className={styles.container}>
      <MenuClient initialData={menuData} />
    </main>
  );
}
