import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { lookupClerkUsers } from '@/lib/clerkUserLookup';
import { NextResponse } from 'next/server';
import { getAdminUsers } from '@/lib/adminData';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const users = await getAdminUsers();
  return NextResponse.json(users);
}
