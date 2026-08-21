'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, X, UserCheck, RefreshCw } from 'lucide-react';

interface NameRequest {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  currentName: string;
  requestedName: string;
  status: string;
  createdAt: string;
  decidedAt: string | null;
}

export default function AdminNameRequestsPage() {
  const [requests, setRequests] = useState<NameRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/name-requests');
      const json = await res.json();
      setRequests(json.requests ?? []);
    } catch {
      showToast('Failed to load requests', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const decide = async (id: string, action: 'approve' | 'reject') => {
    setActionId(id + '-' + action);
    try {
      const res = await fetch('/api/admin/name-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, action }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(
          action === 'approve' ? `Name change approved → "${json.newName}"` : 'Name change rejected',
          true
        );
        await fetchRequests();
      } else {
        showToast(json.error || 'Action failed', false);
      }
    } catch {
      showToast('Network error — try again', false);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 transition-all ${
          toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <UserCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Resume Name Requests</h1>
          </div>
          <p className="text-sm text-slate-400 ml-11.5">
            Users get <span className="text-white font-semibold">4 free name changes</span> on their resume. After that, every change comes here for your approval.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Pending badge */}
      {!loading && (
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6 ${
          requests.length > 0
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${requests.length > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          {requests.length > 0
            ? `${requests.length} pending request${requests.length !== 1 ? 's' : ''}`
            : 'All caught up — no pending requests'}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-3 text-slate-400 py-12">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading requests…</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="text-slate-400 text-sm">No pending name-change requests right now.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">User (Email & Name)</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Name</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Requested Name</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {r.userEmail || r.userId}
                        </span>
                        {r.userName && r.userName !== r.userEmail && (
                          <span className="text-xs text-slate-400">({r.userName})</span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">ID: {r.userId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-400">{r.currentName || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-white">{r.requestedName}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(r.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => decide(r.id, 'approve')}
                        disabled={actionId !== null}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {actionId === r.id + '-approve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => decide(r.id, 'reject')}
                        disabled={actionId !== null}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {actionId === r.id + '-reject' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        Reject
                      </button>
                    </div>
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
