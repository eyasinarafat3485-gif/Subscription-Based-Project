'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  Loader2,
  ExternalLink,
  ShoppingBag,
  Users,
  CreditCard,
  DollarSign,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserCheck,
  UserX,
  PackageCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getPaginationRange } from '@/lib/pagination';

export default function AdminPublicCollectionsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    visitorOrders: 0,
    registeredOrders: 0,
  });

  const fetchOrdersData = async (page = 1, searchQuery = '') => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/public-collections?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
          setCurrentPage(data.page || 1);
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.totalItems || 0);
          if (data.stats) setStats(data.stats);
        }
      } else {
        toast.error('Failed to load orders data');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      toast.error('Server connection error!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData(1, search);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrdersData(1, search);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchOrdersData(newPage, search);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const paginationPages = getPaginationRange(currentPage, totalPages);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            <span>Public Orders & Collections Log</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Real-time live database log of all customer orders, purchases, visitor transactions, and sales records.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search order ID, name, email, phone, TxID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
              fetchOrdersData(1, e.target.value);
            }}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-2xs font-bold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </form>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Orders</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.totalOrders.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Revenue</p>
            <h3 className="text-xl font-black text-emerald-600 mt-0.5">৳{stats.totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Visitor Purchases</p>
            <h3 className="text-xl font-black text-slate-700 mt-0.5">{stats.visitorOrders.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Member Orders</p>
            <h3 className="text-xl font-black text-blue-600 mt-0.5">{stats.registeredOrders.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Orders Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-500">Loading order records from database...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Orders Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No orders matched your search parameters. Try clearing the search or check back when new orders arrive.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Order ID & Type</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Product / Item</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Payment & TxID</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/70 transition">
                    {/* Order ID & Type */}
                    <td className="p-4">
                      <div className="font-mono font-black text-slate-900">{ord.orderId}</div>
                      <div className="mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                            ord.type === 'product'
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {ord.type === 'product' ? 'Visitor' : 'Membership'}
                        </span>
                      </div>
                    </td>

                    {/* Customer Details */}
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">{ord.customer.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{ord.customer.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ord.customer.phone}</div>
                      <div className="mt-1">
                        {(() => {
                          const r = (ord.role || (ord.isVisitor ? 'visitor' : 'user')).toLowerCase();
                          if (r === 'admin') {
                            return (
                              <span className="bg-purple-100 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider">
                                Admin
                              </span>
                            );
                          }
                          if (r === 'guest') {
                            return (
                              <span className="bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider">
                                Guest
                              </span>
                            );
                          }
                          if (r === 'user') {
                            return (
                              <span className="bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider">
                                Registered User
                              </span>
                            );
                          }
                          return (
                            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider">
                              Visitor
                            </span>
                          );
                        })()}
                      </div>
                    </td>

                    {/* Product Title & Image */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {ord.productImage ? (
                          <img
                            src={ord.productImage}
                            alt={ord.title}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200 shrink-0">
                            <PackageCheck className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-extrabold text-slate-900 line-clamp-1">{ord.title}</span>
                          {ord.productSlug && (
                            <Link
                              href={`/products/${ord.productSlug}`}
                              target="_blank"
                              className="text-[10px] text-blue-600 font-medium hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              <span>View Product</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-4 font-black text-slate-900 text-sm">৳{ord.price}</td>

                    {/* Payment Method & Transaction ID */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase">
                          {ord.paymentMethod}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Acc: <span className="font-bold text-slate-700">{ord.senderAccount}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        TxID: <span className="font-bold text-indigo-600">{ord.transactionId}</span>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="p-4 text-slate-600">
                      <div className="font-bold">{formatDate(ord.createdAt)}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatTime(ord.createdAt)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-extrabold text-[10px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {ord.status ? ord.status.toUpperCase() : 'COMPLETED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && orders.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500">
              Showing page <span className="text-slate-900 font-extrabold">{currentPage}</span> of{' '}
              <span className="text-slate-900 font-extrabold">{totalPages}</span> ({totalItems} total orders)
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {paginationPages.map((p, i) =>
                  p === '...' ? (
                    <span key={i} className="px-2 text-xs font-bold text-slate-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={i}
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        currentPage === p
                          ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
