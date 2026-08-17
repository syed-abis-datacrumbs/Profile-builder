import { isAdmin } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Ticket, CreditCard, Users, LogOut, ShieldCheck } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? null;
  const isAuthorized = await isAdmin(email);
  
  if (!isAuthorized) {
    redirect('/');
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/unlocked', label: 'Unlocked Users', icon: Users },
  ];

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
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors group"
            >
              <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

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
