import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { BUILDER_ACCESS_EMAILS } from '@/lib/accessConfig';

export async function isAdmin(email: string | null): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  if (BUILDER_ACCESS_EMAILS.has(cleanEmail)) return true;

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(cleanEmail);
}

export async function isUserAdmin(user: { emailAddresses?: Array<{ emailAddress: string }> } | null): Promise<boolean> {
  if (!user || !user.emailAddresses || user.emailAddresses.length === 0) return false;
  for (const addr of user.emailAddresses) {
    if (await isAdmin(addr.emailAddress)) return true;
  }
  return false;
}

export async function requireAdmin(): Promise<{ userId: string } | NextResponse> {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const authorized = await isUserAdmin(user);
  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return { userId: user.id };
}

export async function requireTestingAccess(): Promise<{ userId: string; user: any } | NextResponse> {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const authorized = await isUserAdmin(user);
  if (!authorized) {
    return NextResponse.json(
      { error: 'Momentum is currently in private testing phase. Access is restricted to administrators.' },
      { status: 403 }
    );
  }
  return { userId: user.id, user };
}

