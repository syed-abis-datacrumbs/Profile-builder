import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { apiSuccess, apiBadRequest, apiServerError } from '@/lib/apiResponse';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const data = await req.json();

  if (!data.status) {
    return apiBadRequest('Status is required');
  }

  try {
    const updated = await (db as any).profileBuilderIssue.update({
      where: { id },
      data: { status: data.status },
    });
    return apiSuccess({ success: true, issue: updated });
  } catch (err: any) {
    return apiServerError('Failed to update issue', err);
  }
}
