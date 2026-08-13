'use client';

import { useState } from 'react';
import { Globe, Plus, Star, Layers, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminPublicCollectionsPage() {
  const [collections, setCollections] = useState([
    { title: 'Top 10 Essential WooCommerce Plugins 2026', itemsCount: 10, views: '3.2k', rating: '4.9', status: 'Public Featured' },
    { title: 'Elementor Pro Agency Toolkit Bundle', itemsCount: 8, views: '5.1k', rating: '5.0', status: 'Public Featured' },
    { title: 'WordPress Speed & Security Master Pack', itemsCount: 6, views: '2.8k', rating: '4.8', status: 'Public' },
    { title: 'Bangla Newspaper & Portal Theme Bundle', itemsCount: 5, views: '1.9k', rating: '4.7', status: 'Public' },
  ]);

  const handleCreateNew = () => {
    const title = prompt('পাবলিক কালেকশনের নাম লিখুন:');
    if (title) {
      setCollections([
        { title, itemsCount: 1, views: '0', rating: '5.0', status: 'Public' },
        ...collections
      ]);
      toast.success(`"${title}" পাবলিক কালেকশনে যোগ করা হয়েছে!`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">পাবলিক কালেকশন (Public Collections)</h1>
          <p className="text-slate-500 text-xs mt-1">কমিউনিটি ও ভিজিটরদের জন্য পাবলিশ করা সেরা ওয়ার্ডপ্রেস রিসোর্স বান্ডেল সমূহ</p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন বান্ডেল কালেকশন তৈরি করুন</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {collections.map((item, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between group shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {item.status}
                </span>
                <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {item.rating}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  {item.itemsCount} টি প্লাগইন/থিম
                </span>
                <span>•</span>
                <span>{item.views} বার দেখা হয়েছে</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Developers Club Curated</span>
              <button
                onClick={() => toast.info(`"${item.title}" প্রিভিউ মোড ওপেন হচ্ছে...`)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>ভিউ বান্ডেল</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
