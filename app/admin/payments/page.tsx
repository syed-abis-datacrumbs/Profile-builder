'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, Image as ImageIcon, CreditCard } from 'lucide-react';

type Proof = {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  imageUrl: string;
  status: string;
  extractedTitle: string | null;
  extractedAmount: string | null;
  extractedAccountNumber: string | null;
  titleMatched: boolean;
  numberMatched: boolean;
  amountMatched: boolean;
  tamperSignal: boolean;
  decisionReason: string | null;
  createdAt: string;
};

const STATUS_TABS = ['APPROVED', 'REJECTED'];

export default function PaymentsPage() {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('APPROVED');
  const [actionId, setActionId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Proof | null>(null);

  const load = (status: string) => {
    setLoading(true);
    fetch(`/api/admin/payments?status=${status}`)
      .then((r) => r.json())
      .then(setProofs)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(activeTab); }, [activeTab]);

  const action = async (id: string, act: 'approve' | 'reject' | 'pending') => {
    setActionId(id);
    await fetch(`/api/admin/payments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: act }),
    });
    setActionId(null);
    setPreview(null);
    load(activeTab);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Payment Approvals</h1>
        <p className="text-slate-400 text-sm mt-1">Review and approve payment screenshots from users</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800 rounded-lg w-fit mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
              activeTab === tab ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : proofs.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No {activeTab.toLowerCase()} payments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proofs.map((p) => (
            <div key={p.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-start gap-4 flex-col sm:flex-row">
              {/* Screenshot Thumbnail */}
              <button
                onClick={() => setPreview(p)}
                className="shrink-0 w-16 h-16 rounded-lg border border-slate-600 overflow-hidden bg-slate-900 hover:opacity-80 transition-opacity"
              >
                <img src={p.imageUrl} alt="proof" className="w-full h-full object-cover" />
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">
                      {p.userEmail || p.userId}
                    </span>
                    {p.userName && p.userName !== p.userEmail && (
                      <span className="text-xs text-slate-400">({p.userName})</span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60" title={`Full Clerk User ID: ${p.userId}`}>
                      ID: {p.userId}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    p.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400'
                    : p.status === 'REJECTED' ? 'bg-red-500/15 text-red-400'
                    : 'bg-amber-500/15 text-amber-400'
                  }`}>{p.status}</span>
                  {p.tamperSignal && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">⚠️ Tamper Signal</span>}
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className={`flex items-center gap-1 ${p.titleMatched ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {p.titleMatched ? '✓' : '✗'} Title: {p.extractedTitle || '—'}
                  </span>
                  <span className={`flex items-center gap-1 ${p.numberMatched ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {p.numberMatched ? '✓' : '✗'} Acct: {p.extractedAccountNumber || '—'}
                  </span>
                  <span className={`flex items-center gap-1 ${p.amountMatched ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {p.amountMatched ? '✓' : '✗'} Amount: {p.extractedAmount || '—'}
                  </span>
                </div>

                <p className="text-slate-500 text-xs mt-1">{new Date(p.createdAt).toLocaleString()}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0 flex-wrap self-end sm:self-center">
                {p.status !== 'APPROVED' && (
                  <button
                    onClick={() => action(p.id, 'approve')}
                    disabled={actionId === p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    Approve
                  </button>
                )}
                {p.status !== 'REJECTED' && (
                  <button
                    onClick={() => action(p.id, 'reject')}
                    disabled={actionId === p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    Reject
                  </button>
                )}
                {/* Pending button commented out for now:
                {p.status !== 'PENDING' && (
                  <button
                    onClick={() => action(p.id, 'pending')}
                    disabled={actionId === p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                    Mark Pending
                  </button>
                )} */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img src={preview.imageUrl} alt="Payment Proof" className="w-full rounded-lg max-h-[65vh] object-contain bg-black" />
            <div className="flex gap-2 mt-4 flex-wrap">
              {preview.status !== 'APPROVED' && (
                <button
                  onClick={() => action(preview.id, 'approve')}
                  disabled={actionId === preview.id}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionId === preview.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve
                </button>
              )}
              {preview.status !== 'REJECTED' && (
                <button
                  onClick={() => action(preview.id, 'reject')}
                  disabled={actionId === preview.id}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionId === preview.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reject
                </button>
              )}
              {/* Pending button commented out for now:
              {preview.status !== 'PENDING' && (
                <button
                  onClick={() => action(preview.id, 'pending')}
                  disabled={actionId === preview.id}
                  className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionId === preview.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                  Mark Pending
                </button>
              )} */}
            </div>
            <button onClick={() => setPreview(null)} className="w-full mt-2 py-2 text-slate-400 hover:text-white text-sm transition-colors font-medium">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
