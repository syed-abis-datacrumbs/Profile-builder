import { requireAdmin } from '@/lib/adminAuth';
import { isAdmin } from '@/lib/adminAuth';
import { getCurrentUserId } from '@/lib/serverAuth';
import { NextResponse } from 'next/server';

export async function GET() {
  const userId = await getCurrentUserId();
  return NextResponse.json({ isAdmin: isAdmin(userId) });
}
