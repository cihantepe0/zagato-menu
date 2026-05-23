import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'menuData.json');

export async function GET() {
  try {
    const dataStr = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(dataStr);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const newData = await request.json();
    await fs.writeFile(DATA_PATH, JSON.stringify(newData, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
