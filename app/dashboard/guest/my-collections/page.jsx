'use client';

import { useState } from 'react';
import { FolderHeart, Download, Search, Sparkles, Award } from 'lucide-react';
import { toast } from 'react-toastify';

export default function GuestMyCollectionsPage() {
  const [search, setSearch] = useState('');

  const collections = [
    { title: 'Elementor Pro Free Trial Pack', category: 'Page Builder', version: 'v3.24.0', added: '১০ আগস্ট, ২০২৬' },
    { title: 'Astra Theme Starter Kit', category: 'GPL Theme', version: 'v4.7.1', added: '০৮ আগস্ট, ২০২৬' },
  ];

  const filtered = collections.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (title) => {
    toast.success(`গেস্ট ট্রায়াল দিয়ে ${title} ফাইল জিপ ডাউনলোড শুরু হয়েছে!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">মাই কালেকশন (Guest Collections)</h1>
          <p className="text-slate-500 text-xs mt-1">গেস্ট ফ্রী ট্রায়াল দিয়ে আপনার ডাউনলোড করা প্লাগইন ও থিম তালিকা</p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="কালেকশন খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between group shadow-xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{item.version}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {item.title}
              </h3>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">ডাউনলোড: {item.added}</span>
              <button
                onClick={() => handleDownload(item.title)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
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
