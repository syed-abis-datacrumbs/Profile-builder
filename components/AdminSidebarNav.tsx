'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Ticket, CreditCard, Users, ShieldCheck, MessageSquare, UserCheck, Bug } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/chats', label: 'AI Chats', icon: MessageSquare },
  { href: '/admin/issues', label: 'Issues', icon: Bug },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/name-requests', label: 'Name Requests', icon: UserCheck },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-3 space-y-0.5">
      {navItems.map(({ href, label, icon: Icon }) => {
        // Special case for dashboard to avoid matching all routes
        const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors group ${
              isActive
                ? 'bg-blue-600/10 text-blue-400 font-medium'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon 
              className={`w-4 h-4 transition-colors ${
                isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'
              }`} 
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
