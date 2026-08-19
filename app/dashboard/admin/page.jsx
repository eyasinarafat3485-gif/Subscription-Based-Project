'use client';

import { useState, useEffect } from 'react';
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
  ArrowUpRight,
  Loader2,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalProducts: 0,
    todayDownloads: 0,
    activeCoupons: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Professional Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: '',
  });

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStatsData(data.stats);
        }
        if (data.recentUsers) {
          setRecentUsers(data.recentUsers);
        }
      }
    } catch (err) {
      console.error('Fetch admin stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleRoleSelect = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `User role updated to ${newRole.toUpperCase()}`);
        setRecentUsers(recentUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      } else {
        toast.error(data.error || 'Failed to update role');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection error!');
    } finally {
      setUpdatingId(null);
    }
  };

  const openDeleteModal = (userId, userName) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName: userName || 'User',
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      userId: null,
      userName: '',
    });
  };

  const confirmDeleteUser = async () => {
    const { userId, userName } = deleteModal;
    if (!userId) return;

    try {
      setDeletingId(userId);
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `"${userName}" has been deleted from database`);
        setRecentUsers(recentUsers.filter((u) => u.id !== userId));
        closeDeleteModal();
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection error!');
    } finally {
      setDeletingId(null);
    }
  };

  const stats = [
    {
      label: 'Total Users',
      value: `${statsData.totalUsers.toLocaleString('en-US')}`,
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      trend: 'Live Database',
    },
    {
      label: 'Active Products',
      value: `${statsData.totalProducts.toLocaleString('en-US')}`,
      icon: FolderHeart,
      color: 'from-purple-600 to-pink-600',
      trend: 'Live Products',
    },
    {
      label: 'Active Coupons',
      value: `${statsData.activeCoupons.toLocaleString('en-US')}`,
      icon: Ticket,
      color: 'from-amber-500 to-orange-500',
      trend: 'Active Vouchers',
    },
  ];

  const quickActions = [
    { title: 'Add New Product', href: '/dashboard/admin/add-product', icon: PlusCircle, bg: 'bg-blue-50 border-blue-200 text-blue-700' },
    { title: 'Generate Guest Coupon', href: '/dashboard/admin/get-cupon', icon: Ticket, bg: 'bg-amber-50 border-amber-200 text-amber-700' },
    { title: 'View All Users List', href: '/dashboard/admin/all-users', icon: Users, bg: 'bg-purple-50 border-purple-200 text-purple-700' },
    { title: 'Manage Public Collections', href: '/dashboard/admin/public-collections', icon: Globe, bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-lg shadow-blue-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-blue-100">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Admin Management Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">System Control Panel</h1>
            <p className="text-xs sm:text-sm text-blue-100/90 font-medium">Manage users, view real-time system stats, manage products and generate coupons.</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
            >
              {loading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              )}
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
          <span>Quick Actions</span>
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

      {/* Recent Activity Table - Matches Exact Columns from Reference UI */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm relative">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">List of recently registered users</h3>
            <p className="text-xs text-slate-500">Live data of members who registered on the latest platform from the MongoDB database</p>
          </div>
          <Link
            href="/dashboard/admin/all-users"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
          >
            See all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">NAME (NAME)</th>
                <th className="pb-3 font-bold">EMAIL (EMAIL)</th>
                <th className="pb-3 font-bold">ROLE (ROLE)</th>
                <th className="pb-3 font-bold">NUMBER OF DOWNLOADS</th>
                <th className="pb-3 font-bold">JOINING DATE</th>
                <th className="pb-3 font-bold text-right pr-2">ACTION (ACTION)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-1" />
                    <span>Loading user data...</span>
                  </td>
                </tr>
              ) : recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                    No user data found.
                  </td>
                </tr>
              ) : (
                recentUsers.slice(0, 3).map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    
                    {/* NAME (NAME) */}
                    <td className="py-3.5 font-bold text-slate-900 flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        style={{ display: user.image ? 'none' : 'flex' }}
                        className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 border ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                            : user.role === 'guest'
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="truncate max-w-[150px] sm:max-w-none">{user.name}</span>
                    </td>

                    {/* EMAIL (EMAIL) */}
                    <td className="py-3.5 text-slate-600 font-mono">{user.email}</td>

                    {/* ROLE (ROLE) Pill Badge */}
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          user.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : user.role === 'guest'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {user.role ? user.role.toUpperCase() : 'USER'}
                      </span>
                    </td>

                    {/* NUMBER OF DOWNLOADS */}
                    <td className="py-3.5 text-slate-800 font-bold">{user.downloads || 0}</td>

                    {/* JOINING DATE */}
                    <td className="py-3.5 text-slate-500">{user.createdAt}</td>

                    {/* ACTION (ACTION): Role Select Dropdown & Delete Button */}
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Role Select Dropdown */}
                        <select
                          value={user.role || 'user'}
                          onChange={(e) => handleRoleSelect(user.id, e.target.value)}
                          disabled={updatingId === user.id}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs border focus:outline-none transition cursor-pointer shadow-2xs ${
                            user.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 focus:border-purple-500'
                              : user.role === 'guest'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 focus:border-amber-500'
                              : 'bg-blue-50 text-blue-700 border-blue-200 focus:border-blue-500'
                          }`}
                        >
                          <option value="user" className="bg-white text-slate-800 font-bold">User (USER)</option>
                          <option value="guest" className="bg-white text-slate-800 font-bold">Guest (GUEST)</option>
                          <option value="admin" className="bg-white text-slate-800 font-bold">Admin (ADMIN)</option>
                        </select>

                        {/* Delete Trigger Button */}
                        <button
                          onClick={() => openDeleteModal(user.id, user.name)}
                          disabled={deletingId === user.id}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition cursor-pointer disabled:opacity-50"
                          title="Delete user from database"
                        >
                          {deletingId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professional Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-100 shadow-2xl relative transition-all transform scale-100">
            
            {/* Close Button */}
            <button
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Icon & Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">Confirm User Deletion</h3>
                <p className="text-slate-500 text-xs mt-0.5">Permanent database deletion action</p>
              </div>
            </div>

            {/* Modal Body Message */}
            <div className="p-4 rounded-2xl bg-red-50/80 border border-red-100 text-xs text-slate-700 leading-relaxed font-medium space-y-1">
              <p>
                Are you sure you want to permanently delete <span className="font-black text-slate-900">"{deleteModal.userName}"</span> from the database?
              </p>
              <p className="text-red-600 text-[11px] font-bold">
                ⚠️ Once this action is completed, all account data and access for this user will be permanently deleted!
              </p>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={deletingId === deleteModal.userId}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-red-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {deletingId === deleteModal.userId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
