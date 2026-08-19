'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  Loader2,
  ExternalLink,
  Download,
  Users,
  FolderHeart,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getPaginationRange } from '@/lib/pagination';

export default function AdminPublicCollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    totalDownloads: 0,
    uniqueProducts: 0,
    activeUsers: 0,
  });

  const fetchPublicCollections = async (page = 1, searchQuery = '') => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/public-collections?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCollections(data.collections || []);
          setCurrentPage(data.page || 1);
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.totalItems || 0);
          if (data.stats) setStats(data.stats);
        }
      } else {
        toast.error('Failed to load public collections data');
      }
    } catch (err) {
      console.error('Fetch public collections error:', err);
      toast.error('Server connection error!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicCollections(1, search);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPublicCollections(1, search);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchPublicCollections(newPage, search);
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
            <span>Public Collections & Live Downloads</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Real-time dynamic log of all downloaded WordPress plugins, themes and resources across all users.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search product, user or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
              fetchPublicCollections(1, e.target.value);
            }}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Downloads</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.totalDownloads.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Download className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Unique Resources</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.uniqueProducts.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <FolderHeart className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active Downloaders</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.activeUsers.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs font-bold text-slate-400">Loading public downloads log...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="py-16 text-center space-y-3 p-6">
            <FolderHeart className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-black text-slate-800">No Download Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search ? `No results found matching "${search}".` : 'When users download resources, their activity log will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">User Info</th>
                  <th className="py-3.5 px-4">Downloaded Resource</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {collections.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-slate-50/70 transition-colors">
                    {/* User Info Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {item.userImage ? (
                          <img
                            src={item.userImage}
                            alt={item.userName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {item.userName ? item.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 truncate max-w-[140px] sm:max-w-[180px]">
                            {item.userName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate max-w-[140px] sm:max-w-[180px]">
                            {item.userEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Product Info Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.productTitle}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
                            <Download className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-slate-900 truncate max-w-[180px] sm:max-w-[240px]">
                              {item.productTitle}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[9px] font-bold border border-indigo-200/60 shrink-0">
                              {item.version || 'v1.0.0'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            Category: <span className="text-slate-700 font-semibold">{item.category || 'Plugin'}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Download Date & Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{formatDate(item.downloadedAt)}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{formatTime(item.downloadedAt)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={item.slug ? `/products/${item.slug}` : `/resources`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs transition border border-slate-200 hover:border-blue-600 cursor-pointer shadow-2xs"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer Controls (Per page 10 items) */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-900">{Math.min(totalItems, (currentPage - 1) * 10 + 1)}</span> to{' '}
              <span className="font-bold text-slate-900">{Math.min(totalItems, currentPage * 10)}</span> of{' '}
              <span className="font-bold text-slate-900">{totalItems}</span> download logs
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 transition cursor-pointer disabled:opacity-50 disabled:hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {paginationPages.map((pageItem, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => typeof pageItem === 'number' && handlePageChange(pageItem)}
                  disabled={pageItem === '...'}
                  className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    pageItem === currentPage
                      ? 'bg-blue-600 text-white shadow-xs'
                      : pageItem === '...'
                      ? 'bg-transparent text-slate-400 cursor-default'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pageItem}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 transition cursor-pointer disabled:opacity-50 disabled:hover:bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
