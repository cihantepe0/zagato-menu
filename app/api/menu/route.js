import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getMenuData, saveMenuData } from '@/lib/dataHelper';

export async function GET() {
  try {
    const data = await getMenuData();
    return NextResponse.json(data);
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
