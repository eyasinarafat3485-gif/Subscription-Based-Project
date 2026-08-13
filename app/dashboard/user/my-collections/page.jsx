'use client';

import { useState } from 'react';
import { FolderHeart, Download, Search, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

export default function UserMyCollectionsPage() {
  const [search, setSearch] = useState('');

  const collections = [
    { title: 'Elementor Pro v3.24 (Original Zip)', category: 'Page Builder', version: 'v3.24.0', added: '১০ আগস্ট, ২০২৬' },
    { title: 'WP Rocket Premium v3.16.2', category: 'Cache & Speed', version: 'v3.16.2', added: '০৮ আগস্ট, ২০২৬' },
    { title: 'Astra Pro Addon Package', category: 'GPL Theme', version: 'v4.7.1', added: '০৫ আগস্ট, ২০২৬' },
    { title: 'Yoast SEO Premium Package', category: 'SEO Plugin', version: 'v22.8', added: '০১ আগস্ট, ২০২৬' },
  ];

  const filtered = collections.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (title) => {
    toast.success(`${title} ফাইল জিপ ডাউনলোড শুরু হয়েছে!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">মাই কালেকশন (My Collections)</h1>
          <p className="text-slate-400 text-xs mt-1">আপনার সেভ করা ও সক্রিয় প্লাগইন এবং থিম তালিকা</p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="কালেকশন খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{item.version}</span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                {item.title}
              </h3>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">সংরক্ষিত: {item.added}</span>
              <button
                onClick={() => handleDownload(item.title)}
                className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ডাউনলোড</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
