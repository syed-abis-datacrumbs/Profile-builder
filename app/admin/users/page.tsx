import { getAdminUsers } from '@/lib/adminData';
import { requireAdmin } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { UsersClient } from './UsersClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    redirect('/');
  }

  const initialUsers = await getAdminUsers();

  return <UsersClient initialUsers={initialUsers} />;
}
