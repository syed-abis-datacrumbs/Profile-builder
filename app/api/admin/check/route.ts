import { currentUser } from '@clerk/nextjs/server';
import { isUserAdmin } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await currentUser();
  const adminStatus = await isUserAdmin(user);
  return NextResponse.json({ isAdmin: adminStatus });
}
