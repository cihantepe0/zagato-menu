import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'menuData.json');

// Upload image → convert to base64 → store directly in JSON
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const categoryId = formData.get('categoryId');
    const itemIndex = parseInt(formData.get('itemIndex'), 10);

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Update the JSON directly
    const dataStr = await fs.readFile(DATA_PATH, 'utf8');
    const allData = JSON.parse(dataStr);

    const catIndex = allData.findIndex(c => c.id === categoryId);
    if (catIndex === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (!allData[catIndex].items[itemIndex]) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    allData[catIndex].items[itemIndex].img = dataUrl;
    await fs.writeFile(DATA_PATH, JSON.stringify(allData, null, 2), 'utf8');

    return NextResponse.json({ success: true, url: dataUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
  }
}
