'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FolderHeart, Download, Search, Sparkles, Award, Loader2, ExternalLink, Package } from 'lucide-react';
import { toast } from 'react-toastify';

export default function GuestMyCollectionsPage() {
  const [search, setSearch] = useState('');
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/user/collections');
        if (res.ok) {
          const data = await res.json();
          if (data?.collections) {
            setCollections(data.collections);
          }
        }
      } catch (err) {
        console.error('Failed to load guest collections:', err);
      } finally {
        setLoading(false);
      }
    };

    const clearDownloadNotifications = async () => {
      try {
        await fetch('/api/user/download-notifications', { method: 'PATCH' });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('profileUpdated'));
        }
      } catch (e) {}
    };

    fetchCollections();
    clearDownloadNotifications();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filtered = collections.filter(item =>
    (item.title || item.productTitle || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (item) => {
    if (item.downloadUrl) {
      toast.success(`Starting download for ${item.title || item.productTitle}...`);
      window.open(item.downloadUrl, '_blank');
    } else {
      toast.info(`Preparing download file for ${item.title || item.productTitle}...`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Collections</h1>
          <p className="text-slate-500 text-xs mt-1">The list of plugins and themes downloaded on your account.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search collections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading your collections...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <FolderHeart className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-800">No Collections Saved</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Downloaded items with your active trial or membership will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, idx) => (
            <div key={item._id || idx} className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between group shadow-xs">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {item.image ? (
                    <img
                      src={
                        item.image.startsWith('http') || item.image.startsWith('data:') || item.image.startsWith('/')
                          ? item.image
                          : `/${item.image}`
                      }
                      alt={item.title || item.productTitle}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 shadow-2xs"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=200&auto=format&fit=crop';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100 truncate">
                        {item.category || 'Plugin'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{item.version || 'v1.0.0'}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.title || item.productTitle}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Downloaded: {formatDate(item.downloadedAt)}</span>
                <Link
                  href={item.slug ? `/products/${item.slug}` : `/resources`}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer border border-blue-100/80 shadow-2xs group-hover:border-blue-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
