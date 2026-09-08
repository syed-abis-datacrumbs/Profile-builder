'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Users,
  MessageSquare,
  Bug,
  CreditCard,
  UserCheck,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/admin/traffic', label: 'Traffic', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/chats', label: 'AI Chats', icon: MessageSquare },
  { href: '/admin/issues', label: 'Issues', icon: Bug },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/name-requests', label: 'Name Requests', icon: UserCheck },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync collapse state with localStorage
  useEffect(() => {
    const saved = localStorage.getItem('momentum_admin_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('momentum_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!isMobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isMobileOpen]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans text-slate-900">
      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 -ml-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/admin/traffic" prefetch={false} className="flex items-center gap-2 min-w-0 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="MOMENTUM Logo"
              className="w-7 h-7 object-contain shrink-0 rounded-md group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight uppercase group-hover:text-blue-600 transition-colors">
                MOMENTUM
              </span>
              <span className="text-[10px] font-semibold tracking-wide bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                Admin
              </span>
            </div>
          </Link>
        </div>

        <Link
          href="/"
          prefetch={false}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Exit</span>
        </Link>
      </header>

      {/* Mobile Drawer (Slide-in Modal) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="relative w-[17rem] max-w-[85vw] h-full flex flex-col bg-white border-r border-slate-200/90 shadow-2xl z-10"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200/90">
                <Link
                  href="/admin/traffic"
                  prefetch={false}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2.5 min-w-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="MOMENTUM Logo"
                    className="w-7 h-7 object-contain shrink-0 rounded-md"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight uppercase">
                      MOMENTUM
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium tracking-tight">
                      Admin Panel
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname.startsWith(href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      prefetch={false}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all font-medium ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs border border-blue-100/80'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-slate-200/90 bg-slate-50/50">
                <Link
                  href="/"
                  prefetch={false}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-slate-400" />
                  Back to App
                </Link>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-white border-r border-slate-200/90 shadow-xs h-screen sticky top-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[4.5rem]' : 'w-64'
        }`}
      >
        {/* Desktop Sidebar Header */}
        <div className={`border-b border-slate-200/90 ${isCollapsed ? 'p-3 flex flex-col items-center gap-3' : 'px-4 py-3.5 flex items-center justify-between'}`}>
          {isCollapsed ? (
            <>
              <button
                type="button"
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-5 h-5 text-blue-600" />
              </button>
              <Link href="/admin/traffic" prefetch={false} title="MOMENTUM Admin">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="MOMENTUM Logo"
                  className="w-7 h-7 object-contain shrink-0 rounded-md hover:scale-105 transition-transform"
                />
              </Link>
            </>
          ) : (
            <>
              <Link href="/admin/traffic" prefetch={false} className="flex items-center gap-2.5 group min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="MOMENTUM Logo"
                  className="w-8 h-8 object-contain shrink-0 rounded-md group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 leading-tight uppercase group-hover:text-blue-600 transition-colors">
                    MOMENTUM
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium tracking-tight">
                    Admin Panel
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Desktop Nav Items */}
        <nav className={`flex-1 overflow-y-auto space-y-1 ${isCollapsed ? 'p-2 flex flex-col items-center' : 'p-3'}`}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);

            if (isCollapsed) {
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={false}
                  title={label}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-100/80 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                prefetch={false}
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
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Sidebar Bottom */}
        <div className={`border-t border-slate-200/90 ${isCollapsed ? 'p-2 flex justify-center' : 'p-3'}`}>
          {isCollapsed ? (
            <Link
              href="/"
              prefetch={false}
              title="Back to App"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-4.5 h-4.5 text-slate-400" />
            </Link>
          ) : (
            <Link
              href="/"
              prefetch={false}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              Back to App
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
}
