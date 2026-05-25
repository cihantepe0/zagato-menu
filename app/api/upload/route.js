import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getMenuData, saveMenuData } from '@/lib/dataHelper';
import sharp from 'sharp';

const MAX_WIDTH = 600;
const MAX_HEIGHT = 600;
const JPEG_QUALITY = 78;

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
    const originalKB = Math.round(inputBuffer.length / 1024);

    const compressedBuffer = await sharp(inputBuffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    const compressedKB = Math.round(compressedBuffer.length / 1024);
    console.log(`Image compressed: ${originalKB}KB → ${compressedKB}KB`);

    const dataUrl = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;

    // Load current data, update item, save back
    const allData = await getMenuData();
    const catIndex = allData.findIndex(c => c.id === categoryId);
    if (catIndex === -1) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    if (!allData[catIndex].items[itemIndex]) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    allData[catIndex].items[itemIndex].img = dataUrl;
    await saveMenuData(allData);

    return NextResponse.json({ success: true, url: dataUrl, meta: { originalKB, compressedKB } });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
  }
}
