'use client';

import Link from 'next/link';
import {
  Download,
  FolderHeart,
  User,
  Sparkles,
  Zap,
  CheckCircle,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function UserDashboardPage() {
  const stats = [
    { label: 'Membership Status', value: 'PRO Member', icon: ShieldCheck, color: 'from-blue-600 to-indigo-600' },
    { label: "Today's Download Limit", value: '8 / 10 remaining', icon: Download, color: 'from-emerald-600 to-teal-600' },
    { label: 'My Collections', value: '12 Plugins', icon: FolderHeart, color: 'from-purple-600 to-pink-600' },
  ];

  const recentDownloads = [
    { title: 'Elementor Pro v3.24 (Original Zip)', category: 'Page Builder', date: 'Today, 1:15 PM', version: 'v3.24.0' },
    { title: 'WP Rocket Premium v3.16.2', category: 'Cache & Speed', date: 'Yesterday, 4:30 PM', version: 'v3.16.2' },
    { title: 'Astra Pro Addon Package', category: 'GPL Theme', date: '10 August, 2026', version: 'v4.7.1' },
    { title: 'Yoast SEO Premium + WooCommerce', category: 'SEO Plugin', date: '05 August, 2026', version: 'v22.8' },
  ];

  const handleReDownload = (title) => {
    toast.success(`Re-downloading ${title} file!`);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-lg shadow-blue-500/15">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Developers Club Member Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, Developer Club Member! 👋
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Easily browse your subscription status, saved product collections, and download unlimited plugins.
            </p>
          </div>

          <Link
            href="/dashboard/user/my-collections"
            className="px-5 py-3 rounded-2xl bg-white text-blue-600 hover:bg-slate-100 text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <FolderHeart className="w-4 h-4" />
            <span>View My Collections</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{stat.label}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-slate-900">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Downloads Table */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-blue-600" />
              <span>Recently Downloaded Plugins & Themes</span>
            </h3>
            <p className="text-xs text-slate-500">The latest files downloaded from your account.</p>
          </div>
          <Link
            href="/dashboard/user/my-collections"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
          >
            See all collections →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">ITEM NAME</th>
                <th className="pb-3 font-bold">CATEGORY</th>
                <th className="pb-3 font-bold">VERSION</th>
                <th className="pb-3 font-bold">DOWNLOAD DATE</th>
                <th className="pb-3 font-bold text-right">DOWNLOAD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentDownloads.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item.title}</span>
                  </td>
                  <td className="py-3.5 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold text-[10px] border border-blue-100">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-500 font-mono">{item.version}</td>
                  <td className="py-3.5 text-slate-500">{item.date}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleReDownload(item.title)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span suppressHydrationWarning>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
