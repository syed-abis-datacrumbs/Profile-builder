import { useState } from 'react';
import { Ticket, Loader2, Copy, Check, Trash2, Edit2, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export type Coupon = {
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

export function CouponsTab({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [form, setForm] = useState({ code: '', label: '', maxUses: '1', expiresAt: '' });
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/coupons');
      const data = await r.json();
      setCoupons(data);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setForm({ code: '', label: '', maxUses: '1', expiresAt: '' });
    setFormError('');
    setEditingId(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      setFormError('Code is required');
      return;
    }
    setFormError('');
    setCreating(true);

    try {
      const url = editingId ? `/api/admin/coupons/${editingId}` : '/api/admin/coupons';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save coupon');
      }

      toast.success(editingId ? 'Coupon updated' : 'Coupon created');
      setShowForm(false);
      fetchCoupons();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
        );
        toast.success(`Coupon ${currentStatus ? 'disabled' : 'enabled'}`);
      } else {
        throw new Error('Failed');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        toast.success('Coupon deleted');
      } else {
        throw new Error('Failed');
      }
    } catch {
      toast.error('Failed to delete coupon');
    } finally {
      setDeletingId(null);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Coupons</h2>
          <p className="text-sm text-slate-400">Manage all generated coupons.</p>
        </div>
        {!showForm && (
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> New Coupon
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
          <h2 className="text-lg font-bold text-white mb-4">
            {editingId ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Coupon Code (e.g. FREE2024)</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="FREE2024"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Label / Note (optional)</label>
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
              onClick={handleSave}
              disabled={creating}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg flex items-center gap-2"
            >
              {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingId ? 'Save Changes' : 'Create Coupon'}
            </button>
            <button
              onClick={() => { setShowForm(false); setFormError(''); setEditingId(null); }}
              className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-slate-800/50 rounded-xl border border-slate-700">
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
                        onClick={() => toggleStatus(c.id, c.isActive)}
                        disabled={togglingId === c.id}
                        className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${c.isActive ? 'text-amber-400' : 'text-emerald-400'}`}
                        title={c.isActive ? 'Disable coupon' : 'Enable coupon'}
                      >
                        {togglingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : c.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteCoupon(c.id)}
                        disabled={deletingId === c.id}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                        title="Delete coupon"
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
