'use client';

import { useState, useEffect } from 'react';
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
  Award,
  Loader2,
  ExternalLink,
  Package
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function GuestDashboardPage() {
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
        console.error('Error fetching guest dashboard data:', err);
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
      label: 'Account Status',
      value: profile?.membership?.planTitle || 'Guest Free Pass',
      icon: Award,
      color: 'from-amber-500 to-orange-500',
      badge: 'Active Guest',
    },
    {
      label: "Today's Free Trial Downloads",
      value: loading ? 'Loading...' : `${downloadsToday} / ${dailyLimit}`,
      icon: Download,
      color: 'from-blue-600 to-indigo-600',
      badge: "Today's Limit",
      isLimitCard: true,
    },
    {
      label: 'Guest Coupon Status',
      value: profile?.membership?.status === 'active' ? 'Active Membership' : 'Free Pass',
      icon: Ticket,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Voucher Active',
    },
  ];

  const handleDownload = (item) => {
    if (item.downloadUrl) {
      window.open(item.downloadUrl, '_blank');
      toast.success(`Opening download link for ${item.productTitle || item.title}!`);
    } else {
      toast.info(`Download requested for ${item.productTitle || item.title || 'Item'}!`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Guest Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-6 sm:p-8 shadow-lg shadow-amber-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-3">
              <Gift className="w-3.5 h-3.5 text-amber-200" />
              <span>Developers Club Guest Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, Guest Member! 🎉
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-xl">
              You are on guest access. Upgrade to Pro Membership to download unlimited premium plugins, themes, and versions.
            </p>
          </div>

          <Link
            href="/dashboard/guest/my-collections"
            className="px-5 py-3 rounded-2xl bg-white text-amber-700 hover:bg-amber-50 text-xs font-black shadow-lg flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <span>My Collections</span>
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
                {stat.isLimitCard && !loading ? (
                  <div className="flex items-center gap-1.5 font-black text-2xl">
                    <span className="text-emerald-600 font-extrabold">{downloadsToday}</span>
                    <span className="text-slate-300 font-normal">/</span>
                    <span className="text-indigo-600 font-extrabold">{dailyLimit}</span>
                  </div>
                ) : (
                  <span className="text-xl font-black text-slate-900">{stat.value}</span>
                )}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {stat.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>


      {/* Guest Downloads List */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Guest Free Download Collection</h3>
            <p className="text-xs text-slate-500">The list of items downloaded using your guest pass.</p>
          </div>
          <Link
            href="/dashboard/guest/my-collections"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
          >
            See all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-8 text-center text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-600" />
              <p className="text-xs font-medium">Loading download collections...</p>
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
                  <th className="pb-3 font-bold">DATE</th>
                  <th className="pb-3 font-bold text-right">ACTION</th>
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
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-semibold text-[10px] border border-blue-100">
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
                      <Link
                        href={item.slug ? `/products/${item.slug}` : '/products'}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-extrabold text-xs transition inline-flex items-center gap-1.5 ml-auto cursor-pointer border border-blue-100/80 shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </Link>
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
