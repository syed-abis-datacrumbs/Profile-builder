import { getAdminNameRequests } from '@/lib/adminData';
import { requireAdmin } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { NameRequestsClient } from './NameRequestsClient';

export const dynamic = 'force-dynamic';

export default async function AdminNameRequestsPage() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    redirect('/');
  }

  const initialRequests = await getAdminNameRequests();

  return <NameRequestsClient initialRequests={initialRequests} />;
}
