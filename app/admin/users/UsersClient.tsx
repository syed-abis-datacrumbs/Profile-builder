'use client';

import { useEffect, useState } from 'react';
import { Users, Loader2, Plus, ShieldCheck, Ticket, User, MoreVertical, ShieldX } from 'lucide-react';
import toast from '@/lib/toast';
import { CouponsTab, type Coupon } from './CouponsTab';

type UserData = {
  userId: string;
  email: string;
  name: string;
  planStatus: 'Free' | 'Paid';
  couponStatus: 'Active' | 'Deactive' | null;
  unlockedAt: string | null;
  createdAt: string | null;
};

import { formatKarachiDate, formatKarachiTime } from '@/lib/dateUtils';

function formatSafeDate(dateStr: string | null | undefined): { date: string; time: string } | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return {
      date: formatKarachiDate(d),
      time: formatKarachiTime(d),
    };
  } catch {
    return null;
  }
}

export function UsersClient({ initialUsers, initialCoupons }: { initialUsers: UserData[], initialCoupons: Coupon[] }) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Free' | 'Paid' | 'Coupons'>('All');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Initial data is already loaded via SSR, so we only fetch when manually triggered
  // useEffect(() => { fetchUsers(); }, []);

  const changeStatus = async (userId: string, status: 'Free' | 'Paid') => {
    setOpenDropdownId(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`User access updated to ${status}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (activeTab === 'All') return true;
    return u.planStatus === activeTab;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users & Coupons</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage Momentum users and profile builder coupons
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-200/60 rounded-xl w-fit max-w-full overflow-x-auto mb-6">
        {['All', 'Free', 'Paid', 'Coupons'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
              activeTab === tab
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab !== 'Coupons' ? loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl text-slate-400 shadow-xs">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-slate-600">No users found in this category.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">User</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Signed Up</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Unlocked At</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const signupFormatted = formatSafeDate(user.createdAt);
                const unlockFormatted = formatSafeDate(user.unlockedAt);

                return (
                  <tr key={user.userId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200/60 flex items-center justify-center shrink-0 text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-900 font-semibold">{user.name}</p>
                          <p className="text-slate-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {signupFormatted ? (
                        <div className="flex flex-col">
                          <span className="text-slate-800 text-xs font-medium">
                            {signupFormatted.date}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {signupFormatted.time}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {user.planStatus === 'Free' && !user.couponStatus && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                          <User className="w-3.5 h-3.5" />
                          Free Plan
                        </span>
                      )}
                      {user.planStatus === 'Paid' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Paid Unlock
                        </span>
                      )}
                      {user.planStatus === 'Free' && user.couponStatus === 'Active' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                          <Ticket className="w-3.5 h-3.5" />
                          Active Coupon
                        </span>
                      )}
                      {user.planStatus === 'Free' && user.couponStatus === 'Deactive' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                          <Ticket className="w-3.5 h-3.5" />
                          Deactivated Coupon
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {unlockFormatted ? (
                        <div className="flex flex-col">
                          <span className="text-slate-800 text-xs font-medium">
                            {unlockFormatted.date}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {unlockFormatted.time}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                  <td className="px-5 py-4 text-right relative">
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === user.userId ? null : user.userId)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openDropdownId === user.userId && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenDropdownId(null)}
                        />
                        <div className="absolute right-6 top-10 z-50 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1">
                          {user.planStatus !== 'Free' || user.couponStatus ? (
                            <button
                              onClick={() => changeStatus(user.userId, 'Free')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                            >
                              <ShieldX className="w-4 h-4" />
                              {user.couponStatus ? 'Deactivate Coupon' : 'Revoke Access'}
                            </button>
                          ) : (
                            <button
                              onClick={() => changeStatus(user.userId, 'Paid')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors text-left font-medium"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              Grant Paid Access
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        <CouponsTab initialCoupons={initialCoupons} />
      )}
    </div>
  );
}
