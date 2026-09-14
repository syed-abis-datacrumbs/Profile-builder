import { isUserAdmin } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { AdminShell } from '@/components/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const isAuthorized = await isUserAdmin(user);
  
  if (!isAuthorized) {
    redirect('/');
  }

  return <AdminShell>{children}</AdminShell>;
}

