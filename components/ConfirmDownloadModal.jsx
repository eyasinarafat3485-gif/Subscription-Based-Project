'use client';

import { useState } from 'react';
import { Download, ShieldCheck, X, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ConfirmDownloadModal({ isOpen, onClose, product, userMembership }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !product) return null;

  const planId = userMembership?.planId || 'basic';
  const dailyLimit = userMembership?.dailyLimit || (planId === 'premium' ? 20 : planId === 'standard' ? 10 : 5);
  const downloadsToday = typeof userMembership?.downloadsToday === 'number' ? userMembership.downloadsToday : 0;
  const remaining = Math.max(0, dailyLimit - downloadsToday);

  const handleConfirmDownload = async () => {
    try {
      setLoading(true);

      const payload = {
        productId: product._id || product.id,
        productTitle: product.title || product.productTitle || 'WordPress Resource',
        slug: product.slug || '',
        category: product.category || 'Plugin',
        version: product.version || 'Latest',
        image: product.image || '',
        downloadUrl: product.downloadUrl || '',
      };

      const res = await fetch('/api/user/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Download confirmed! Starting download for ${product.title}...`);
        
        // Notify application to update active membership remaining count in UI
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('profileUpdated'));
        }

        // Start file download
        if (data.downloadUrl || product.downloadUrl) {
          window.open(data.downloadUrl || product.downloadUrl, '_blank');
        } else {
          toast.info('Preparing zip file download...');
        }

        onClose();
      } else {
        toast.error(data.error || 'Failed to process download. Please try again.');
      }
    } catch (err) {
      console.error('Download Confirm Error:', err);
      toast.error('Network error. Could not confirm download.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 p-6 text-white relative">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">
                ACTIVE MEMBERSHIP DIRECT DOWNLOAD
              </span>
              <h2 className="text-lg font-black tracking-tight text-white leading-tight">
                Confirm Download
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Product Card Preview */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
              {product.image ? (
                <img src={product.image} alt={product.title} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-indigo-600 text-white font-black text-lg flex items-center justify-center">
                  {product.title ? product.title.charAt(0).toUpperCase() : 'P'}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 inline-block mb-1">
                {product.category || 'Plugin'}
              </span>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                {product.title}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {product.version || 'v1.0.0'} • Instant Access
              </p>
            </div>
          </div>

          {/* Daily Limit Status Box */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Download className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">TODAY'S DOWNLOAD LIMIT</p>
                <div className="flex items-baseline gap-1 font-mono text-sm font-black mt-0.5">
                  <span className="text-emerald-400 text-base">{downloadsToday}</span>
                  <span className="text-slate-400 text-xs">/</span>
                  <span className="text-indigo-300 text-base">{dailyLimit}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">REMAINING</span>
              <span className="text-xs font-black text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 inline-block mt-0.5">
                {remaining} Left Today
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-semibold text-center leading-relaxed">
            Downloading this item will save it to your <strong className="text-slate-800">My Collections</strong> in your dashboard and deduct 1 count from today's limit.
          </p>

          {/* Modal Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer border border-slate-200"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmDownload}
              disabled={loading || remaining <= 0}
              className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Confirm & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
