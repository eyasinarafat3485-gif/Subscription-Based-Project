'use client';

import Link from 'next/link';
import {
  Users,
  FolderHeart,
  PlusCircle,
  Ticket,
  Globe,
  TrendingUp,
  Download,
  ShieldCheck,
  Zap,
  ArrowUpRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'মোট নিবন্ধিত ইউজার', value: '১,২৪৮ জন', icon: Users, color: 'from-blue-600 to-indigo-600', trend: '+১২.৫%' },
    { label: 'সক্রিয় প্লাগইন ও থিম', value: '৪৫০+ টি', icon: FolderHeart, color: 'from-purple-600 to-pink-600', trend: '+৮ টি নতুন' },
    { label: 'আজকের ডাউনলোড সংখ্যা', value: '৩২৮ টি', icon: Download, color: 'from-emerald-600 to-teal-600', trend: '+১৮%' },
    { label: 'সক্রিয় কুপন কোড', value: '১৫ টি', icon: Ticket, color: 'from-amber-500 to-orange-500', trend: 'সক্রিয়' },
  ];

  const quickActions = [
    { title: 'নতুন প্লাগইন যোগ করুন', href: '/dashboard/admin/add-product', icon: PlusCircle, bg: 'bg-blue-50 border-blue-200 text-blue-700' },
    { title: 'গেস্ট কুপন জেনারেট করুন', href: '/dashboard/admin/get-cupon', icon: Ticket, bg: 'bg-amber-50 border-amber-200 text-amber-700' },
    { title: 'অল ইউজার লিস্ট দেখুন', href: '/dashboard/admin/all-users', icon: Users, bg: 'bg-purple-50 border-purple-200 text-purple-700' },
    { title: 'পাবলিক কালেকশন পরিচালন', href: '/dashboard/admin/public-collections', icon: Globe, bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  ];

  const recentUsers = [
    { name: 'Tanvir Hossain', email: 'tanvir@devclub.com', role: 'PRO Member', date: 'আজ, ৩:৪৫ PM' },
    { name: 'Rakibul Islam', email: 'rakib@wpbd.com', role: 'VIP Developer', date: 'আজ, ২:১০ PM' },
    { name: 'Suhail Ahmed', email: 'suhail@agency.io', role: 'Free Member', date: 'গতকাল, ১১:২০ AM' },
    { name: 'Naimur Rahman', email: 'naim@elementor.dev', role: 'PRO Member', date: 'গতকাল, ০৯:১৫ AM' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-lg shadow-blue-500/15">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              <span>এডমিন কন্ট্রোল প্যানেল</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              স্বাগতম, Developers Club Admin! 🚀
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              প্ল্যাটফর্মের সকল ইউজার, ওয়ার্ডপ্রেস প্লাগইন, থিম এবং গেস্ট কুপন কোড সহজে ম্যানেজ করুন।
            </p>
          </div>
          <Link
            href="/dashboard/admin/add-product"
            className="px-5 py-3 rounded-2xl bg-white text-blue-600 hover:bg-slate-100 text-xs font-extrabold shadow-md flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>দ্রুত একশন (Quick Actions)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                href={action.href}
                className={`p-4 rounded-2xl border ${action.bg} hover:scale-[1.02] transition-all flex items-center justify-between group shadow-xs`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-bold">{action.title}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">সাম্প্রতিক ইউজার রেজিস্ট্রেশন</h3>
            <p className="text-xs text-slate-500">সর্বশেষ প্ল্যাটফর্মে যোগদানকারী মেম্বারদের তালিকা</p>
          </div>
          <Link
            href="/dashboard/admin/all-users"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
          >
            সব দেখুন →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">ইউজার</th>
                <th className="pb-3 font-bold">ইমেইল</th>
                <th className="pb-3 font-bold">প্ল্যান</th>
                <th className="pb-3 font-bold">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentUsers.map((user, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 font-bold text-slate-800 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[11px]">
                      {user.name.charAt(0)}
                    </div>
                    {user.name}
                  </td>
                  <td className="py-3.5 text-slate-600">{user.email}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] border border-blue-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-500">{user.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
