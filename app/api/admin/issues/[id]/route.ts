import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const data = await req.json();

  if (!data.status) {
    return NextResponse.json({ error: 'Status is required' }, { status: 400 });
  }

  try {
    const updated = await (db as any).profileBuilderIssue.update({
      where: { id },
      data: { status: data.status },
    });
    return NextResponse.json({ success: true, issue: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
}
