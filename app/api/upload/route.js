import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const categoryId = formData.get('categoryId');
    const itemIndex = formData.get('itemIndex');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/items directory
    const uploadsDir = path.join(process.cwd(), 'public', 'items');
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split('.').pop();
    const filename = `${categoryId}_${itemIndex}_${Date.now()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    await fs.writeFile(filepath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/items/${filename}` 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
