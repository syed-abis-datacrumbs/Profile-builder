import { getAdminCoupons } from '@/lib/adminData';
import { requireAdmin } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { CouponsClient } from './CouponsClient';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    redirect('/');
  }

  const initialCoupons = await getAdminCoupons();

  return <CouponsClient initialCoupons={initialCoupons} />;
}
