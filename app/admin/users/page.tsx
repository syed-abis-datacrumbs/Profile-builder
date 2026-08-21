'use client';

import { useEffect, useState } from 'react';
import { Users, Loader2, Plus, ShieldCheck, Ticket, User, MoreVertical, ShieldX } from 'lucide-react';
import { GenerateCouponModal } from '@/components/GenerateCouponModal';
import toast from 'react-hot-toast';

type UserData = {
  userId: string;
  email: string;
  name: string;
  planStatus: 'Free' | 'Paid' | 'Coupon';
  unlockedAt: string | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Free' | 'Paid' | 'Coupon'>('All');
  const [showGenerateCoupon, setShowGenerateCoupon] = useState(false);
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

  useEffect(() => {
    fetchUsers();
  }, []);

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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? '…' : `${users.length} total users`} across all tools
          </p>
        </div>
        <button
          onClick={() => setShowGenerateCoupon(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Coupon
        </button>
      </div>

      {showGenerateCoupon && (
        <GenerateCouponModal
          onClose={() => setShowGenerateCoupon(false)}
          onSuccess={() => fetchUsers()}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['All', 'Free', 'Paid', 'Coupon'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-500">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No users found in this category.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Unlocked At</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.userId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-medium shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-200 font-medium">{user.name}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {user.planStatus === 'Free' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                        <User className="w-3.5 h-3.5" />
                        Free Plan
                      </span>
                    )}
                    {user.planStatus === 'Paid' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Paid Unlock
                      </span>
                    )}
                    {user.planStatus === 'Coupon' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                        <Ticket className="w-3.5 h-3.5" />
                        Coupon
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {user.unlockedAt ? (
                      <span className="text-slate-300">{new Date(user.unlockedAt).toLocaleDateString()}</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right relative">
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === user.userId ? null : user.userId)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openDropdownId === user.userId && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenDropdownId(null)}
                        />
                        <div className="absolute right-6 top-10 z-50 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden py-1">
                          {user.planStatus !== 'Free' ? (
                            <button
                              onClick={() => changeStatus(user.userId, 'Free')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors text-left"
                            >
                              <ShieldX className="w-4 h-4" />
                              Revoke Access
                            </button>
                          ) : (
                            <button
                              onClick={() => changeStatus(user.userId, 'Paid')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-400 hover:bg-slate-700 transition-colors text-left"
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
