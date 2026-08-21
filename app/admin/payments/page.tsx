import { getAdminPayments } from '@/lib/adminData';
import { requireAdmin } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { PaymentsClient } from './PaymentsClient';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    redirect('/');
  }

  const initialTab = searchParams.tab || 'APPROVED';
  const initialProofs = await getAdminPayments(initialTab);

  return <PaymentsClient initialProofs={initialProofs} initialTab={initialTab} />;
}
