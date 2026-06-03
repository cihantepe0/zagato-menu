import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getMenuData } from '@/lib/dataHelper';

export async function GET(request, { params }) {
  try {
    const { categoryId } = params;
    const allData = await getMenuData();
    const cat = allData.find(c => c.id === categoryId);
    if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    // Return only this category with images
    return NextResponse.json(cat, {
      headers: { 'Cache-Control': 'private, max-age=60' }
    });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
