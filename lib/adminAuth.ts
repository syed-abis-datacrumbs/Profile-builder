import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function isAdmin(email: string | null): Promise<boolean> {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export async function requireAdmin(): Promise<{ userId: string } | NextResponse> {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? null;
  
  if (!user || !(await isAdmin(email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return { userId: user.id };
}
