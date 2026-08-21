'use client';

import { useEffect, useState } from 'react';
import { Users, Loader2, CheckCircle } from 'lucide-react';

type Unlock = {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  unlockedAt: string;
};

export default function UnlockedUsersPage() {
  const [users, setUsers] = useState<Unlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/unlocked')
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Unlocked Users</h1>
        <p className="text-slate-400 text-sm mt-1">
          {loading ? '…' : `${users.length} users`} have full access (paid or coupon)
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No unlocked users yet</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/80">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">User (Email & Name)</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Unlocked At</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-slate-500 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {u.userEmail || u.userId}
                        </span>
                        {u.userName && u.userName !== u.userEmail && (
                          <span className="text-xs text-slate-400">({u.userName})</span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">ID: {u.userId}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{new Date(u.unlockedAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Pro Active
                    </span>
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
