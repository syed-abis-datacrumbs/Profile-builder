import { isAdmin } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, LogOut } from 'lucide-react';
import { AdminSidebarNav } from '@/components/AdminSidebarNav';
import { currentUser } from '@clerk/nextjs/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? null;
  const isAuthorized = await isAdmin(email);
  
  if (!isAuthorized) {
    redirect('/');
  }


  return (
    <div className="min-h-screen flex bg-slate-950 font-sans">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col bg-slate-900 border-r border-slate-800">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Profile Builder</p>
              <p className="text-[10px] text-slate-400 leading-tight">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <AdminSidebarNav />

        {/* Bottom */}
        <div className="p-3 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
