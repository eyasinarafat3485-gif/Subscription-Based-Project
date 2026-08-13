'use client';

import Link from 'next/link';
import {
  Download,
  FolderHeart,
  Ticket,
  Sparkles,
  Zap,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  Gift,
  Award
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function GuestDashboardPage() {
  const stats = [
    { label: 'একাউন্ট স্ট্যাটাস', value: 'Guest Free Pass', icon: Award, color: 'from-amber-500 to-orange-500', badge: 'ট্রায়াল এক্সেস' },
    { label: 'আজকের ফ্রী ট্রায়াল ডাউনলোড', value: '২ / ৩ টি বাকি', icon: Download, color: 'from-blue-600 to-indigo-600', badge: 'আজকের লিমিট' },
    { label: 'গেস্ট কুপন স্ট্যাটাস', value: 'সক্রিয় (Active)', icon: Ticket, color: 'from-emerald-600 to-teal-600', badge: 'ফ্রী ভাউচার' },
  ];

  const guestDownloads = [
    { title: 'Elementor Pro Free Trial Pack', category: 'Page Builder', date: 'আজ, ১০:১৫ AM', version: 'v3.24.0' },
    { title: 'Astra Theme Starter Kit', category: 'GPL Theme', date: 'গতকাল, ৩:২০ PM', version: 'v4.7.1' },
  ];

  const handleDownload = (title) => {
    toast.success(`গেস্ট ফ্রী পাস দিয়ে ${title} জিপ ডাউনলোড শুরু হয়েছে!`);
  };

  return (
    <div className="space-y-8">
      {/* Guest Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-lg shadow-blue-500/15">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-3">
              <Gift className="w-3.5 h-3.5 text-amber-300" />
              <span>Developers Club Guest Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              স্বাগতম, গেস্ট মেম্বার! 🎉
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              আপনি গেস্ট এক্সেসে আছেন। আনলিমিটেড প্লাগইন, থিম ও প্রো ভার্সন ডাউনলোড করতে প্রো মেম্বারশিপে আপগ্রেড করুন।
            </p>
          </div>

          <Link
            href="/#pricing"
            className="px-5 py-3 rounded-2xl bg-white text-blue-600 hover:bg-slate-100 text-xs font-black shadow-lg flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <span>PRO মেম্বারশিপ নিন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Guest Stats Grid */}
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
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900">{stat.value}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {stat.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Banner Callout */}
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900">আনলিমিটেড প্লাগইন এক্সেস চান?</h3>
            <p className="text-xs text-amber-700">মাত্র ৪99 টাকায় নিয়ে নিন আনলিমিটেড লাইফটাইম ডিরেক্ট ডাউনলোড মেম্বারশিপ</p>
          </div>
        </div>
        <Link
          href="/#pricing"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-sm shrink-0"
        >
          আপগ্রেড করুন
        </Link>
      </div>

      {/* Guest Downloads List */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">গেস্ট ফ্রী ডাউনলোড কালেকশন</h3>
            <p className="text-xs text-slate-500">আপনার গেস্ট পাস দিয়ে ডাউনলোড করা আইটেম সমূহের তালিকা</p>
          </div>
          <Link
            href="/dashboard/guest/my-collections"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
          >
            সব দেখুন →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">আইটেম এর নাম</th>
                <th className="pb-3 font-bold">ক্যাটাগরি</th>
                <th className="pb-3 font-bold">ভার্সন</th>
                <th className="pb-3 font-bold">তারিখ</th>
                <th className="pb-3 font-bold text-right">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guestDownloads.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item.title}</span>
                  </td>
                  <td className="py-3.5 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-semibold text-[10px] border border-blue-100">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-500 font-mono">{item.version}</td>
                  <td className="py-3.5 text-slate-500">{item.date}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleDownload(item.title)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-xs transition ml-auto cursor-pointer"
                    >
                      ডাউনলোড
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
