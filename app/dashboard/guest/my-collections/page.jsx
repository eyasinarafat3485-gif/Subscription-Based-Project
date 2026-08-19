'use client';

import { useState, useEffect } from 'react';
import { FolderHeart, Download, Search, Sparkles, Award, Loader2 } from 'lucide-react';
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

    fetchCollections();
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
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
                    {item.category || 'Plugin'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.version || 'v1.0.0'}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {item.title || item.productTitle}
                </h3>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Downloaded: {formatDate(item.downloadedAt)}</span>
                <button
                  onClick={() => handleDownload(item)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span suppressHydrationWarning>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
