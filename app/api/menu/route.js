import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getMenuData, saveMenuData } from '@/lib/dataHelper';

export async function GET(request) {
  try {
    const data = await getMenuData();
    const { searchParams } = new URL(request.url);
    const full = searchParams.get('full') === '1';

    if (full) {
      // Return full data with images (for admin save operations)
      return NextResponse.json(data);
    }

    // Default: strip images — client fetches per-category
    const light = data.map(cat => ({
      ...cat,
      items: cat.items.map(({ img, ...rest }) => rest),
    }));
    return NextResponse.json(light, {
      headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const newData = await request.json();
    await saveMenuData(newData);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
