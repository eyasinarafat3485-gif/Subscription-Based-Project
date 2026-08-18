'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPaginationRange } from '@/lib/pagination';
import { Loader2, ShoppingBag, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function ChangelogPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const ITEMS_PER_PAGE = 20;

  const fetchChangelogData = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?page=${pageNum}&limit=${ITEMS_PER_PAGE}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.totalProducts || (data.products ? data.products.length : 0));
      }
    } catch (err) {
      console.error('Fetch changelog error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChangelogData(page);
  }, [page]);

  const handleProtectedAction = (e, targetUrl) => {
    if (!session?.user) {
      e.preventDefault();
      router.push(`/login?redirectTo=${encodeURIComponent(targetUrl)}`);
    }
  };

  // Format Date to DD/MM/YYYY hh:mm AM/PM (BDT Time)
  const formatUpdatedDateTime = (dateStr) => {
    if (!dateStr) return '15/03/2026 11:06 AM';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '15/03/2026 11:06 AM';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');

    return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
  };

  const paginationRange = getPaginationRange(page, totalPages);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans flex flex-col justify-between">
      <div>
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          
          {/* Section Header Title Bar (Matching Reference Screenshot "| Changelog") */}
          <div className="flex items-center justify-between border-l-4 border-indigo-600 pl-3 py-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Changelog
              </h1>
            </div>
            <span className="text-xs text-slate-500 font-semibold bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
              Total {totalProducts} Products Updated
            </span>
          </div>

          {/* Main Changelog Table Container (Matching Reference Screenshot Design) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="py-24 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                <p className="text-xs font-extrabold text-slate-500">
                  Loading latest product changelogs...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <History className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-black text-slate-800">No Changelogs Available</h3>
                <p className="text-xs text-slate-500">Check back later for recent product version updates.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  {/* Table Header */}
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                      <th className="py-4 px-6 text-center w-20">Image</th>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6 text-center">Latest Version</th>
                      <th className="py-4 px-6 text-center">Last Updated</th>
                      <th className="py-4 px-6 text-right w-36">Downloads</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {products.map((item) => {
                      const updatedFormatted = formatUpdatedDateTime(item.updatedAt || item.createdAt);
                      const displayVersion = item.version || 'v4.5.2';

                      return (
                        <tr
                          key={item._id ? item._id.toString() : item.slug}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* Image Column */}
                          <td className="py-3.5 px-6 text-center">
                            <div className="w-11 h-11 mx-auto rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-1 relative shadow-2xs group-hover:scale-105 transition-transform">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="max-w-full max-h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                                  {item.title ? item.title.charAt(0).toUpperCase() : 'P'}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Name Column */}
                          <td className="py-3.5 px-6 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            <Link
                              href={`/products/${item.slug}`}
                              onClick={(e) => handleProtectedAction(e, `/products/${item.slug}`)}
                              className="hover:underline line-clamp-1 max-w-xs sm:max-w-md"
                            >
                              {item.title}
                            </Link>
                          </td>

                          {/* Latest Version Column */}
                          <td className="py-3.5 px-6 text-center font-mono font-semibold text-indigo-600 bg-indigo-50/40 rounded-lg">
                            {displayVersion}
                          </td>

                          {/* Last Updated Column */}
                          <td className="py-3.5 px-6 text-center text-slate-500 font-medium">
                            <div className="flex flex-col items-center leading-tight">
                              <span className="text-slate-700 font-semibold">{updatedFormatted.split(' ')[0]}</span>
                              <span className="text-[10px] text-slate-400 font-bold">{updatedFormatted.split(' ').slice(1).join(' ')}</span>
                            </div>
                          </td>

                          {/* Downloads Column (Buy Now Button in Project Theme Color) */}
                          <td className="py-3.5 px-6 text-right">
                            <Link
                              href={`/checkout?product=${item.slug}`}
                              onClick={(e) => handleProtectedAction(e, `/checkout?product=${item.slug}`)}
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs shadow-indigo-500/20 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Buy Now</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls at Bottom (Matching Reference Screenshot Design) */}
            {!loading && totalPages > 1 && (
              <div className="py-6 px-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {paginationRange.map((pageItem, index) => {
                  if (pageItem === '...') {
                    return (
                      <span key={`dots-${index}`} className="px-2 text-slate-400">
                        ...
                      </span>
                    );
                  }

                  const isCurrent = pageItem === page;
                  return (
                    <button
                      key={pageItem}
                      onClick={() => setPage(pageItem)}
                      className={`min-w-[32px] h-[32px] rounded-lg text-xs font-black transition cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {pageItem}
                    </button>
                  );
                })}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
}
