import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import sharp from 'sharp';

const MAX_WIDTH = 600;
const MAX_HEIGHT = 600;
const JPEG_QUALITY = 78;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

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

    // Return the compressed image URL only.
    // The frontend stores it in local state and persists it when user clicks "Kaydet".
    return NextResponse.json({ success: true, url: dataUrl, meta: { originalKB, compressedKB } });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
  }
}
