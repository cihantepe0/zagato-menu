import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const PERSISTENT_PATH = '/app/persistent/menuData.json';
const BUNDLED_PATH = path.join(process.cwd(), 'data', 'menuData.json');

async function getDataPath() {
  try {
    await fs.access(PERSISTENT_PATH);
    return PERSISTENT_PATH;
  } catch {
    try {
      const bundledData = await fs.readFile(BUNDLED_PATH, 'utf8');
      await fs.mkdir('/app/persistent', { recursive: true });
      await fs.writeFile(PERSISTENT_PATH, bundledData, 'utf8');
      return PERSISTENT_PATH;
    } catch {
      return BUNDLED_PATH;
    }
  }
}

// Max dimensions for menu item images (displayed at 90x90 on menu, 72x72 in admin)
const MAX_WIDTH = 600;
const MAX_HEIGHT = 600;
const JPEG_QUALITY = 78; // good quality / small size balance

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const categoryId = formData.get('categoryId');
    const itemIndex = parseInt(formData.get('itemIndex'), 10);

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    // Get original size for logging
    const originalKB = Math.round(inputBuffer.length / 1024);

    // Compress & resize with sharp
    const compressedBuffer = await sharp(inputBuffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',        // keeps aspect ratio, never exceeds max
        withoutEnlargement: true, // don't upscale small images
      })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    const compressedKB = Math.round(compressedBuffer.length / 1024);
    console.log(`Image compressed: ${originalKB}KB → ${compressedKB}KB`);

    // Convert to base64 data URL
    const dataUrl = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;

    // Update JSON
    const dataPath = await getDataPath();
    const dataStr = await fs.readFile(dataPath, 'utf8');
    const allData = JSON.parse(dataStr);

    const catIndex = allData.findIndex(c => c.id === categoryId);
    if (catIndex === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    if (!allData[catIndex].items[itemIndex]) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    allData[catIndex].items[itemIndex].img = dataUrl;
    await fs.writeFile(dataPath, JSON.stringify(allData, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      url: dataUrl,
      meta: { originalKB, compressedKB }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
  }
}
