'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, CreditCard, Ticket, FileText, Clock, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';

type Analytics = {
  totalUnlocked: number;
  pendingPayments: number;
  totalProofs: number;
  totalCoupons: number;
  totalRedemptions: number;
  totalResumes: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: 'Unlocked Users',
      value: stats?.totalUnlocked,
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      href: '/admin/unlocked',
      desc: 'Paid or coupon unlocked',
    },
    {
      label: 'Pending Payments',
      value: stats?.pendingPayments,
      icon: Clock,
      color: stats?.pendingPayments ? 'from-amber-500 to-orange-500' : 'from-slate-600 to-slate-700',
      href: '/admin/payments',
      desc: 'Awaiting your review',
      urgent: (stats?.pendingPayments ?? 0) > 0,
    },
    {
      label: 'Total Coupons',
      value: stats?.totalCoupons,
      icon: Ticket,
      color: 'from-blue-500 to-blue-600',
      href: '/admin/coupons',
      desc: `${stats?.totalRedemptions ?? 0} redeemed`,
    },
    {
      label: 'Saved Resumes',
      value: stats?.totalResumes,
      icon: FileText,
      color: 'from-violet-500 to-violet-600',
      href: '#',
      desc: 'Total across all users',
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Profile Builder overview at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, href, desc, urgent }) => (
          <Link
            key={label}
            href={href}
            className={`relative rounded-xl p-5 flex flex-col gap-3 bg-gradient-to-br ${color} shadow-lg hover:scale-[1.02] transition-transform`}
          >
            {urgent && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            )}
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Icon className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              {loading ? (
                <div className="h-8 w-12 bg-white/20 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-white">{value ?? 0}</p>
              )}
              <p className="text-white/90 font-semibold text-sm mt-0.5">{label}</p>
              <p className="text-white/60 text-xs">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: '/admin/coupons', label: 'Create a Coupon', desc: 'Generate a new coupon code for students', icon: Ticket, action: 'Go to Coupons' },
          { href: '/admin/payments', label: 'Review Payments', desc: 'Approve or reject pending payment proofs', icon: CreditCard, action: 'Review Now' },
          { href: '/admin/unlocked', label: 'View Unlocked Users', desc: 'See all users with full access', icon: CheckCircle, action: 'View Users' },
        ].map(({ href, label, desc, icon: Icon, action }) => (
          <Link
            key={href}
            href={href}
            className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 hover:bg-slate-800 hover:border-slate-600 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                <Icon className="w-4 h-4 text-slate-300" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="mt-3 font-semibold text-white text-sm">{label}</p>
            <p className="text-slate-400 text-xs mt-1">{desc}</p>
            <p className="text-blue-400 text-xs font-semibold mt-3 group-hover:underline">{action} →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
