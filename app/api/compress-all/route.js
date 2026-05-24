import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const DATA_PATH = path.join(process.cwd(), 'data', 'menuData.json');

const MAX_WIDTH = 600;
const MAX_HEIGHT = 600;
const JPEG_QUALITY = 78;

export async function POST() {
  try {
    const dataStr = await fs.readFile(DATA_PATH, 'utf8');
    const allData = JSON.parse(dataStr);

    let totalCompressed = 0;
    let totalSavedKB = 0;
    const results = [];

    for (const category of allData) {
      if (!category.items) continue;

      for (let i = 0; i < category.items.length; i++) {
        const item = category.items[i];
        if (!item.img || !item.img.startsWith('data:image')) continue;

        try {
          // Extract base64 data
          const matches = item.img.match(/^data:image\/[a-z]+;base64,(.+)$/);
          if (!matches) continue;

          const inputBuffer = Buffer.from(matches[1], 'base64');
          const originalKB = Math.round(inputBuffer.length / 1024);

          // Compress
          const compressedBuffer = await sharp(inputBuffer)
            .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
            .toBuffer();

          const compressedKB = Math.round(compressedBuffer.length / 1024);
          const savedKB = originalKB - compressedKB;

          // Only update if we actually saved space (>5KB)
          if (savedKB > 5) {
            category.items[i].img = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
            totalCompressed++;
            totalSavedKB += savedKB;
            results.push({
              category: category.category,
              item: item.name,
              before: `${originalKB}KB`,
              after: `${compressedKB}KB`,
              saved: `${savedKB}KB`,
            });
          }
        } catch (itemError) {
          console.error(`Failed to compress ${item.name}:`, itemError.message);
        }
      }
    }

    await fs.writeFile(DATA_PATH, JSON.stringify(allData, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: `${totalCompressed} görsel sıkıştırıldı, toplam ${totalSavedKB}KB kazanıldı`,
      results,
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
