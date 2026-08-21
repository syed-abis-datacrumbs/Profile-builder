import { getAdminIssues } from '@/lib/adminData';
import { requireAdmin } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { IssuesClient } from './IssuesClient';

export const dynamic = 'force-dynamic';

export default async function AdminIssuesPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    redirect('/');
  }

  const initialStatus = searchParams.status || 'OPEN';
  const initialPage = parseInt(searchParams.page || '1', 10);
  const initialData = await getAdminIssues(initialStatus, initialPage);

  return (
    <IssuesClient
      initialData={initialData}
      initialStatus={initialStatus}
      initialPage={initialPage}
    />
  );
}
