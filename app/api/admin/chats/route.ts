import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getAdminChats } from '@/lib/adminData';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || 'resume';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const data = await getAdminChats(search, type, page);

  return NextResponse.json(data);
}
