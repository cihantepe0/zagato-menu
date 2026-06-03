import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getMenuData } from '@/lib/dataHelper';

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
