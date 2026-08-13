'use client';

import { useState } from 'react';
import { PlusCircle, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminAddProductPage() {
  const [form, setForm] = useState({
    title: '',
    category: 'plugin',
    version: '',
    description: '',
    downloadUrl: '',
    demoUrl: '',
    isFeatured: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`"${form.title || 'নতুন প্রডাক্ট'}" সফলভাবে সাইটে যুক্ত হয়েছে!`);
      setForm({
        title: '',
        category: 'plugin',
        version: '',
        description: '',
        downloadUrl: '',
        demoUrl: '',
        isFeatured: false,
      });
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">এড প্রডাক্ট (Add New Product)</h1>
        <p className="text-slate-500 text-xs mt-1">নতুন ওয়ার্ডপ্রেস প্লাগইন, থিম বা টেমপ্লেট রিসোর্স আপলোড এবং পাবলিশ করুন</p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">প্রডাক্ট এর নাম *</label>
              <input
                type="text"
                placeholder="যেমন: Elementor Pro Full Pack"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">ক্যাটাগরি *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
              >
                <option value="plugin">ওয়ার্ডপ্রেস প্লাগইন (Plugin)</option>
                <option value="theme">জিপিএল থিম (GPL Theme)</option>
                <option value="template">টেমপ্লেট (Template Pack)</option>
                <option value="resource">ডেভেলপার রিসোর্স (Developer Resource)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">ভার্সন (Version Number) *</label>
              <input
                type="text"
                placeholder="যেমন: v3.24.1"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">লাইভ ডেমো ইউআরএল (Demo Link)</label>
              <input
                type="url"
                placeholder="https://example.com/demo"
                value={form.demoUrl}
                onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">জিপ ডাউনলোড লিংক (Direct ZIP Link) *</label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://drive.google.com/.../file.zip"
                value={form.downloadUrl}
                onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
                required
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">প্রডাক্ট ডেসক্রিপশন</label>
            <textarea
              rows={4}
              placeholder="প্রডাক্টের মূল ফিচার ও নির্দেশিকা বাংলায় লিখুন..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="featured"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-100 border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="featured" className="text-slate-700 font-bold select-none cursor-pointer">
              হোমপেজে ফিচারড প্লাগইন হিসেবে প্রদর্শন করুন (Featured Item)
            </label>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'পাবলিশ হচ্ছে...' : 'পাবলিশ করুন (Publish Product)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
