import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getAdminIssues } from '@/lib/adminData';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'OPEN';
  const category = searchParams.get('category') || 'ALL';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const data = await getAdminIssues(status, category, page);

  return NextResponse.json(data);
}
