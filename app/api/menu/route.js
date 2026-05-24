import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import fs from 'fs/promises';
import path from 'path';

// Persistent path (Railway Volume will be mounted here)
const PERSISTENT_PATH = '/app/persistent/menuData.json';
// Bundled default (baked into the Docker image from the repo)
const BUNDLED_PATH = path.join(process.cwd(), 'data', 'menuData.json');

/**
 * Returns the active data path.
 * Priority: persistent volume → bundled default
 * On first run with a volume: copies bundled JSON to the volume.
 */
async function getDataPath() {
  try {
    // Try to access the persistent file
    await fs.access(PERSISTENT_PATH);
    return PERSISTENT_PATH;
  } catch {
    // Persistent file doesn't exist yet — try to initialize it
    try {
      const bundledData = await fs.readFile(BUNDLED_PATH, 'utf8');
      await fs.mkdir('/app/persistent', { recursive: true });
      await fs.writeFile(PERSISTENT_PATH, bundledData, 'utf8');
      console.log('✓ Initialized persistent data from bundled default');
      return PERSISTENT_PATH;
    } catch (initErr) {
      // Volume not mounted or not writable — fall back to bundled path
      console.warn('⚠ Could not initialize persistent storage, using bundled path:', initErr.message);
      return BUNDLED_PATH;
    }
  }
}

export async function GET() {
  try {
    const dataPath = await getDataPath();
    const dataStr = await fs.readFile(dataPath, 'utf8');
    const data = JSON.parse(dataStr);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const newData = await request.json();
    const dataPath = await getDataPath();
    await fs.writeFile(dataPath, JSON.stringify(newData, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
