import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import fs from 'fs/promises';
import path from 'path';

const PERSISTENT_PATH = '/app/persistent/fixMenu.json';
const BUNDLED_PATH = path.join(process.cwd(), 'data', 'fixMenu.json');

async function getFixMenuPath() {
  try {
    await fs.access(PERSISTENT_PATH);
    return PERSISTENT_PATH;
  } catch {
    try {
      const bundled = await fs.readFile(BUNDLED_PATH, 'utf8');
      await fs.mkdir('/app/persistent', { recursive: true });
      await fs.writeFile(PERSISTENT_PATH, bundled, 'utf8');
    } catch {}
    return BUNDLED_PATH;
  }
}

export async function GET() {
  try {
    const p = await getFixMenuPath();
    const data = JSON.parse(await fs.readFile(p, 'utf8'));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ sections: [] });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const p = await getFixMenuPath();
    await fs.writeFile(p, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
