import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { lookupClerkUsers } from '@/lib/clerkUserLookup';
import { NextResponse } from 'next/server';
import { getAdminUsers } from '@/lib/adminData';
import { apiSuccess } from '@/lib/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const users = await getAdminUsers();
  return apiSuccess(users);
}
