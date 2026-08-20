'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  FolderHeart,
  User,
  Sparkles,
  Zap,
  CheckCircle,
  ShieldCheck,
  PackageCheck,
  Loader2,
  Package
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function UserDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [profRes, collRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/user/collections'),
        ]);

        if (profRes.ok) {
          const profData = await profRes.json();
          if (profData?.user) {
            setProfile(profData.user);
          }
        }

        if (collRes.ok) {
          const collData = await collRes.json();
          if (collData?.collections) {
            setCollections(collData.collections);
          }
        }
      } catch (err) {
        console.error('Error fetching user dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const downloadsToday = profile?.membership?.downloadsToday ?? 0;
  const dailyLimit = profile?.membership?.dailyLimit ?? 5;
  const remaining = Math.max(0, dailyLimit - downloadsToday);
  const totalDownloads = profile?.totalDownloads ?? collections.length;

  const stats = [
    {
      label: 'Membership Status',
      value: profile?.membership?.planTitle || 'PRO Member',
      icon: ShieldCheck,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Active Plan',
    },
    {
      label: "Today's Download Limit",
      value: loading ? 'Loading...' : `${downloadsToday} / ${dailyLimit}`,
      icon: Download,
      color: 'from-emerald-600 to-teal-600',
      badge: "Today's Limit",
      isLimitCard: true,
    },
    {
      label: 'My Collections',
      value: `${totalDownloads} ${totalDownloads === 1 ? 'Item' : 'Items'}`,
      icon: FolderHeart,
      color: 'from-purple-600 to-pink-600',
      badge: 'Saved',
    },
  ];

  const handleReDownload = (item) => {
    if (item.downloadUrl) {
      window.open(item.downloadUrl, '_blank');
      toast.success(`Re-downloading ${item.productTitle || item.title}!`);
    } else {
      toast.info(`Download requested for ${item.productTitle || item.title || 'Item'}!`);
    }
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
              <div className="mt-4 flex items-baseline justify-between">
                {stat.isLimitCard && !loading ? (
                  <div className="flex items-center gap-1.5 font-black text-2xl">
                    <span className="text-emerald-600 font-extrabold">{downloadsToday}</span>
                    <span className="text-slate-300 font-normal">/</span>
                    <span className="text-indigo-600 font-extrabold">{dailyLimit}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                )}
                {stat.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {stat.badge}
                  </span>
                )}
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
          {loading ? (
            <div className="py-8 text-center text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-xs font-medium">Loading downloads...</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <p className="text-xs font-medium">No downloaded items in your collection yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">Download plugins from the store to see them listed here.</p>
            </div>
          ) : (
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
                {collections.slice(0, 5).map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 font-bold text-slate-800 flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={
                            item.image.startsWith('http') || item.image.startsWith('data:') || item.image.startsWith('/')
                              ? item.image
                              : `/${item.image}`
                          }
                          alt={item.productTitle || item.title}
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
                      <span className="truncate max-w-[200px] sm:max-w-[280px]">{item.productTitle || item.title || 'WordPress Resource'}</span>
                    </td>
                    <td className="py-3.5 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold text-[10px] border border-blue-100">
                        {item.category || 'GPL Resource'}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500 font-mono">{item.version || 'v1.0.0'}</td>
                    <td className="py-3.5 text-slate-500">
                      {item.downloadedAt || item.savedAt
                        ? new Date(item.downloadedAt || item.savedAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Recently'}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleReDownload(item)}
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
          )}
        </div>
      </div>
    </div>
  );
}
