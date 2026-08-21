import { requireAdmin } from '@/lib/adminAuth';
import { getAdminPayments } from '@/lib/adminData';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;

  const enrichedPayments = await getAdminPayments(status);
  return NextResponse.json(enrichedPayments);
}
