'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Plus, Sparkles, RefreshCw, Trash2, Loader2, ShieldCheck, Mail } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminGetCouponPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [targetEmail, setTargetEmail] = useState('');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        if (data.coupons) {
          setCoupons(data.coupons);
        }
      }
    } catch (err) {
      console.error('Fetch coupons error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      if (targetEmail.trim()) {
        // Send directly to user via guest-requests API
        const res = await fetch('/api/admin/guest-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send-coupon',
            userEmail: targetEmail.trim(),
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success(data.message || `Guest coupon generated and sent to ${targetEmail}!`);
          setTargetEmail('');
          fetchCoupons();
        } else {
          toast.error(data.error || 'Failed to generate coupon');
        }
      } else {
        // Generate general coupon
        const res = await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success(`New 1-Time VIP Coupon ${data.coupon.code} created!`);
          fetchCoupons();
        } else {
          toast.error(data.error || 'Failed to create coupon');
        }
      }
    } catch (err) {
      toast.error('Server error occurred');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (code) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code).catch(() => fallbackCopy(code));
      } else {
        fallbackCopy(code);
      }
    } catch (e) {
      fallbackCopy(code);
    }
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const fallbackCopy = (text) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch (e) {}
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Guest Coupon Management</h1>
        <p className="text-slate-500 text-xs mt-1">Generate and dispatch single-use VIP coupon codes for Guest membership access.</p>
      </div>

      {/* Generate Coupon Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Generate 1-Time Dynamic Guest Coupon</span>
        </h2>

        <form onSubmit={handleCreateCoupon} className="flex flex-col sm:flex-row items-end gap-3 text-xs">
          <div className="flex-1 w-full">
            <label className="block text-slate-700 font-bold mb-1">Target User Email (Optional - directly sends invitation email)</label>
            <div className="relative">
              <input
                type="email"
                placeholder="e.g. user@gmail.com (Leave blank for generic coupon)"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-9 text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{targetEmail.trim() ? 'Generate & Send via Email' : 'Generate 1-Time Coupon'}</span>
          </button>
        </form>
      </div>

      {/* Existing Coupons Table / List */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Database Coupon Codes List</h3>
          <button
            type="button"
            onClick={fetchCoupons}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs">Loading coupons from MongoDB...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            No coupons generated yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {coupons.map((coupon, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition ${
                  coupon.isUsed
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-blue-200 shadow-2xs hover:border-blue-300'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-blue-600 tracking-wider">
                      {coupon.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        coupon.isUsed
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {coupon.isUsed ? 'USED' : 'ACTIVE (1-TIME)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {coupon.isUsed ? (
                      <span>Used by: <strong className="text-slate-600">{coupon.usedBy}</strong></span>
                    ) : coupon.assignedTo ? (
                      <span>Assigned to: <strong className="text-slate-600">{coupon.assignedTo}</strong></span>
                    ) : (
                      <span>Created: {new Date(coupon.createdAt).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>

                {!coupon.isUsed && (
                  <button
                    type="button"
                    onClick={() => handleCopy(coupon.code)}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    {copiedCode === coupon.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedCode === coupon.code ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
