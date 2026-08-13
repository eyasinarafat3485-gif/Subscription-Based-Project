'use client';

import { useState } from 'react';
import { Copy, Check, Plus, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminGetCouponPage() {
  const [coupons, setCoupons] = useState([
    { code: 'DEVGUEST2026-X89A', discount: '100% OFF (Guest Free Pass)', maxUses: 5, used: 2, expiry: '2026-12-31' },
    { code: 'WPDEV-VIP50', discount: '50% OFF Pro Membership', maxUses: 20, used: 14, expiry: '2026-09-30' },
    { code: 'BENGALIT-BONUS', discount: 'Free Theme Access', maxUses: 10, used: 8, expiry: '2026-10-15' },
  ]);
  const [copiedCode, setCopiedCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('100');
  const [newCode, setNewCode] = useState('');

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'DEVGUEST-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(code);
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    const codeToAdd = newCode || `DEVGUEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newEntry = {
      code: codeToAdd,
      discount: `${newDiscount}% OFF (Special Pass)`,
      maxUses: 10,
      used: 0,
      expiry: '2026-12-31',
    };

    setCoupons([newEntry, ...coupons]);
    toast.success(`নতুন কুপন কোড ${codeToAdd} সফলভাবে তৈরি হয়েছে!`);
    setNewCode('');
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`কুপন কোড ${code} কপি করা হয়েছে!`);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleDelete = (code) => {
    setCoupons(coupons.filter(c => c.code !== code));
    toast.error(`কুপন ${code} মুছে ফেলা হয়েছে`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">গেস্ট কুপন ম্যানেজমেন্ট (Get Coupon)</h1>
        <p className="text-slate-500 text-xs mt-1">গেস্ট মেম্বার ও নতুন ইউজারদের জন্য ডিসকাউন্ট ও এক্সেস কুপন কোড তৈরি করুন</p>
      </div>

      {/* Generate Coupon Form */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>নতুন কুপন জেনারেট করুন</span>
        </h2>

        <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">কুপন কোড</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="DEVGUEST-XXXX"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono uppercase focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={generateRandomCode}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="অটোমেটিক জেনারেট করুন"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">ডিসকাউন্ট (%)</label>
            <select
              value={newDiscount}
              onChange={(e) => setNewDiscount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="100">100% OFF (Free Guest Pass)</option>
              <option value="50">50% OFF Discount</option>
              <option value="30">30% OFF Special</option>
              <option value="20">20% OFF Regular</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>কুপন তৈরি করুন</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Coupons */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900">সক্রিয় কুপন কোডের তালিকা</h3>

        <div className="space-y-3">
          {coupons.map((coupon, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-blue-600 tracking-wider">
                    {coupon.code}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    {coupon.discount}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  ব্যবহার: <span className="text-slate-800 font-bold">{coupon.used}/{coupon.maxUses}</span> • মেয়ার শেষ: {coupon.expiry}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  {copiedCode === coupon.code ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCode === coupon.code ? 'কপি হয়েছে' : 'কোড কপি'}</span>
                </button>
                <button
                  onClick={() => handleDelete(coupon.code)}
                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition cursor-pointer"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
