import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getMenuData, saveMenuData } from '@/lib/dataHelper';

export async function GET(request, context) {
  try {
    // Next.js 15: params is a Promise, must be awaited
    const { categoryId } = await context.params;
    const allData = await getMenuData();
    const cat = allData.find(c => c.id === categoryId);
    if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(cat, {
      headers: { 'Cache-Control': 'private, max-age=60' }
    });
  } catch (e) {
    console.error('Category fetch error:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// Save a single category's items. The server merges them into the latest
// stored data, so other categories are never overwritten by a stale copy.
export async function PUT(request, context) {
  try {
    const { categoryId } = await context.params;
    const { items } = await request.json();
    if (!Array.isArray(items)) return NextResponse.json({ error: 'Invalid items' }, { status: 400 });

    const allData = await getMenuData();
    if (!allData.some(c => c.id === categoryId)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await saveMenuData(allData.map(c => (c.id === categoryId ? { ...c, items } : c)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Category save error:', e);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
