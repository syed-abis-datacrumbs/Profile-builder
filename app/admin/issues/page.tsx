import { getAdminIssues } from '@/lib/adminData';
import { requireAdmin } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { IssuesClient } from './IssuesClient';

export const dynamic = 'force-dynamic';

export default async function AdminIssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; page?: string }>;
}) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    redirect('/');
  }

  const params = await searchParams;
  const initialStatus = params.status || 'OPEN';
  const initialCategory = params.category || 'ALL';
  const initialPage = parseInt(params.page || '1', 10);
  const initialData = await getAdminIssues(initialStatus, initialCategory, initialPage);

  return (
    <IssuesClient
      initialData={initialData}
      initialStatus={initialStatus}
      initialCategory={initialCategory}
      initialPage={initialPage}
    />
  );
}
