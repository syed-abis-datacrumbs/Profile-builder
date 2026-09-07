'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Users, MessageSquare, Bug, CreditCard, UserCheck } from 'lucide-react';

const navItems = [
  { href: '/admin/traffic', label: 'Traffic', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/chats', label: 'AI Chats', icon: MessageSquare },
  { href: '/admin/issues', label: 'Issues', icon: Bug },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/name-requests', label: 'Name Requests', icon: UserCheck },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-3 space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all font-medium group ${
              isActive
                ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs border border-blue-100/80'
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <Icon 
              className={`w-4 h-4 transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'
              }`} 
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
