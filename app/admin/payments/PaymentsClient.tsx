'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, Image as ImageIcon, CreditCard } from 'lucide-react';
import { formatKarachiDateTime } from '@/lib/dateUtils';

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

export function PaymentsClient({ initialProofs, initialTab }: { initialProofs: Proof[], initialTab: string }) {
  const [proofs, setProofs] = useState<Proof[]>(initialProofs);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [actionId, setActionId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Proof | null>(null);

  const load = (status: string) => {
    setLoading(true);
    fetch(`/api/admin/payments?status=${status}`)
      .then((r) => r.json())
      .then(setProofs)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Only load if the active tab is not the initial tab that was SSR'd
    if (activeTab === initialTab) {
      setProofs(initialProofs);
    } else {
      load(activeTab);
    }
  }, [activeTab, initialTab, initialProofs]);

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Payment Approvals</h1>
        <p className="text-slate-500 text-sm mt-1">Review and approve payment screenshots from users</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-200/60 rounded-xl w-fit mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" /> Loading…
        </div>
      ) : proofs.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-300" />
          <p className="font-semibold text-slate-700">No {activeTab.toLowerCase()} payments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proofs.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start gap-4 flex-col sm:flex-row">
              {/* Screenshot Thumbnail */}
              <button
                onClick={() => setPreview(p)}
                className="shrink-0 w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <img src={p.imageUrl} alt="proof" className="w-full h-full object-cover" />
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">
                      {p.userEmail || p.userId}
                    </span>
                    {p.userName && p.userName !== p.userEmail && (
                      <span className="text-xs text-slate-500">({p.userName})</span>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    p.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    : p.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                    : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                  }`}>{p.status}</span>
                  {p.tamperSignal && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">⚠️ Tamper Signal</span>}
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className={`flex items-center gap-1 ${p.titleMatched ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                    {p.titleMatched ? '✓' : '✗'} Title: {p.extractedTitle || '—'}
                  </span>
                  <span className={`flex items-center gap-1 ${p.numberMatched ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                    {p.numberMatched ? '✓' : '✗'} Acct: {p.extractedAccountNumber || '—'}
                  </span>
                  <span className={`flex items-center gap-1 ${p.amountMatched ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                    {p.amountMatched ? '✓' : '✗'} Amount: {p.extractedAmount || '—'}
                  </span>
                </div>

                <p className="text-slate-400 text-xs mt-1">{formatKarachiDateTime(p.createdAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0 flex-wrap self-end sm:self-center">
                {p.status !== 'APPROVED' && (
                  <button
                    onClick={() => action(p.id, 'approve')}
                    disabled={actionId === p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {actionId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    Approve
                  </button>
                )}
                {p.status !== 'REJECTED' && (
                  <button
                    onClick={() => action(p.id, 'reject')}
                    disabled={actionId === p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {actionId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={preview.imageUrl} alt="Payment Proof" className="w-full rounded-xl max-h-[65vh] object-contain bg-slate-100" />
            <div className="flex gap-2 mt-4 flex-wrap">
              {preview.status !== 'APPROVED' && (
                <button
                  onClick={() => action(preview.id, 'approve')}
                  disabled={actionId === preview.id}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {actionId === preview.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve
                </button>
              )}
              {preview.status !== 'REJECTED' && (
                <button
                  onClick={() => action(preview.id, 'reject')}
                  disabled={actionId === preview.id}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {actionId === preview.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reject
                </button>
              )}
            </div>
            <button onClick={() => setPreview(null)} className="w-full mt-3 py-2 text-slate-500 hover:text-slate-800 text-sm transition-colors font-medium cursor-pointer">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
