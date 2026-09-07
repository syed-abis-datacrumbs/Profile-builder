import { useState } from 'react';
import { Ticket, Loader2, Copy, Check, Trash2, Edit2, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import toast from '@/lib/toast';

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
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

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

  const confirmDelete = async () => {
    if (!couponToDelete) return;
    const id = couponToDelete.id;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        toast.success('Coupon deleted');
        setCouponToDelete(null);
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
          <h2 className="text-xl font-bold text-slate-900">Coupons</h2>
          <p className="text-sm text-slate-500">Manage all generated coupons.</p>
        </div>
        {!showForm && (
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> New Coupon
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            {editingId ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Coupon Code (e.g. FREE2024)</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="FREE2024"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Label / Note (optional)</label>
              <input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. August batch promo"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Max Uses</label>
              <input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expires At (optional)</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
            </div>
          </div>
          {formError && <p className="text-red-500 text-xs mt-3 font-medium">{formError}</p>}
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={creating}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingId ? 'Save Changes' : 'Create Coupon'}
            </button>
            <button
              onClick={() => { setShowForm(false); setFormError(''); setEditingId(null); }}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Ticket className="w-10 h-10 mx-auto mb-3 text-slate-400 opacity-60" />
          <p className="font-semibold text-slate-800">No coupons yet</p>
          <p className="text-xs text-slate-500 mt-1">Click &quot;New Coupon&quot; to create one</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Code</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Label</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Uses</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Expires</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200/80">{c.code}</span>
                      <button
                        onClick={() => copyCode(c.code, c.id)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        title="Copy code"
                      >
                        {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">{c.label || <span className="text-slate-400 italic">—</span>}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-slate-900 font-semibold">{c._count.redemptions}</span>
                    <span className="text-slate-500"> / {c.maxUses}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{c.expiresAt || <span className="text-slate-400">Never</span>}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      c.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => toggleStatus(c.id, c.isActive)}
                        disabled={togglingId === c.id}
                        className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ${
                          c.isActive
                            ? 'text-emerald-600 hover:text-emerald-700'
                            : 'text-rose-500 hover:text-rose-600'
                        }`}
                        title={c.isActive ? 'Active — click to disable' : 'Disabled — click to enable'}
                      >
                        {togglingId === c.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : c.isActive ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => setCouponToDelete(c)}
                        disabled={deletingId === c.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
      </div>
      )}

      {/* Delete Confirmation Modal Popup */}
      {couponToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => !deletingId && setCouponToDelete(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">Delete Coupon</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to delete coupon{' '}
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-xs border border-slate-200/80">
                    {couponToDelete.code}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCouponToDelete(null)}
                disabled={deletingId === couponToDelete.id}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId === couponToDelete.id}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deletingId === couponToDelete.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
