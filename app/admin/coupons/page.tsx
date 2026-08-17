'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Copy, Check, Ticket } from 'lucide-react';

type Coupon = {
  id: string;
  code: string;
  label: string | null;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { redemptions: number };
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [form, setForm] = useState({ code: '', label: '', maxUses: '1', expiresAt: '' });
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/coupons')
      .then((r) => r.json())
      .then(setCoupons)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async () => {
    setFormError('');
    if (!form.code.trim()) { setFormError('Code is required'); return; }
    setCreating(true);
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code.trim().toUpperCase(),
        label: form.label || null,
        maxUses: Number(form.maxUses) || 1,
        expiresAt: form.expiresAt || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setFormError(data.error || 'Failed'); setCreating(false); return; }
    setForm({ code: '', label: '', maxUses: '1', expiresAt: '' });
    setShowForm(false);
    setCreating(false);
    load();
  };

  const toggleActive = async (c: Coupon) => {
    setTogglingId(c.id);
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    setTogglingId(null);
    load();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    setDeletingId(id);
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    load();
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupon Management</h1>
          <p className="text-slate-400 text-sm mt-1">{coupons.length} coupons total</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Coupon
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-blue-400" />
            Create New Coupon
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Code *</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. AUG-FREE"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Label (optional)</label>
              <input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. August batch promo"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Max Uses</label>
              <input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Expires At (optional)</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          {formError && <p className="text-red-400 text-xs mt-3 font-medium">{formError}</p>}
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg flex items-center gap-2"
            >
              {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Coupon
            </button>
            <button
              onClick={() => { setShowForm(false); setFormError(''); }}
              className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No coupons yet</p>
          <p className="text-xs mt-1">Click "New Coupon" to create one</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/80">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Code</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Label</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Uses</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Expires</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded text-xs">{c.code}</span>
                      <button
                        onClick={() => copyCode(c.code, c.id)}
                        className="text-slate-500 hover:text-blue-400 transition-colors"
                        title="Copy code"
                      >
                        {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{c.label || <span className="text-slate-600 italic">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className="text-white font-semibold">{c._count.redemptions}</span>
                    <span className="text-slate-500"> / {c.maxUses}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{c.expiresAt || <span className="text-slate-600">Never</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => toggleActive(c)}
                        disabled={togglingId === c.id}
                        className="text-slate-400 hover:text-white transition-colors"
                        title={c.isActive ? 'Disable' : 'Enable'}
                      >
                        {togglingId === c.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : c.isActive
                          ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                          : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => deleteCoupon(c.id)}
                        disabled={deletingId === c.id}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        {deletingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
