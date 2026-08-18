'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Eye,
  BookOpen,
  ShoppingBag,
  Loader2,
  Sparkles,
  Layout,
  ExternalLink,
  CheckCircle2,
  FolderKanban
} from 'lucide-react';

const TEMPLATE_TABS = [
  { id: 'All', label: 'All' },
  { id: 'Ecommerce', label: 'Ecommerce Website' },
  { id: 'Business', label: 'Business Website' },
  { id: 'Blog', label: 'Blog Website' },
  { id: 'Landing Page', label: 'Landing Page' },
];

export default function TemplatesPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  const loaderRef = useRef(null);
  const BATCH_SIZE = 16;

  const handleProtectedAction = (e, targetUrl) => {
    if (!session?.user) {
      e.preventDefault();
      router.push(`/login?redirectTo=${encodeURIComponent(targetUrl)}`);
    }
  };

  // Fetch Readymade Website Templates
  const fetchTemplates = async (tab = activeTab, pageNum = 1, isAppend = false) => {
    try {
      if (isAppend) {
        setLoadingMore(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        setLoading(true);
      }

      let url = `/api/products?page=${pageNum}&limit=${BATCH_SIZE}`;
      
      if (tab && tab !== 'All') {
        url += `&search=${encodeURIComponent(tab)}`;
      } else {
        url += `&category=Templates`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let items = data.products || [];

        // If template specific query returns few items, fallback to all available templates/products
        if (items.length === 0 && tab === 'All') {
          const fallbackRes = await fetch(`/api/products?page=${pageNum}&limit=${BATCH_SIZE}`);
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            items = fallbackData.products || [];
          }
        }

        setTotalProducts(data.totalProducts || items.length);

        if (isAppend) {
          setProducts((prev) => [...prev, ...items]);
        } else {
          setProducts(items);
        }

        setHasMore(pageNum < (data.totalPages || 1));
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchTemplates(activeTab, 1, false);
  }, [activeTab]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTemplates(activeTab, nextPage, true);
  };

  // Auto-trigger next batch loading with 2s spinner when scrolled near bottom
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans flex flex-col justify-between">
      <div>
        <Header />

        {/* Page Hero Banner (Matching Reference Screenshot) */}
        <section className="bg-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 text-center">
          <div className="max-w-4xl mx-auto space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">
              WORDPRESS, READYMADE WEBSITE!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Easy solution for creating a website! We offer the best quality Readymade Websites and popular WordPress Themes & Plugins at affordable prices.
            </p>

            {/* Category Filter Tabs (Matching Reference Image) */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
              {TEMPLATE_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${isActive
                        ? 'bg-teal-700 text-white shadow-md'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Product Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {loading ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin text-teal-700 mx-auto" />
              <p className="text-xs font-bold text-slate-500">
                Loading Readymade Website Templates...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <FolderKanban className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-black text-slate-800">
                No Readymade Templates Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try selecting "All" from the filter tabs above to view available templates.
              </p>
              <button
                onClick={() => setActiveTab('All')}
                className="px-4 py-2 bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-teal-800 transition cursor-pointer"
              >
                Show All Templates
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              
              {/* 3-Column Vertical Website Preview Grid (Matching Reference Screenshot) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
                {products.map((item) => {
                  const demoUrl = item.demoUrl || `/products/${item.slug}`;
                  const docUrl = item.docUrl || `/products/${item.slug}`;

                  return (
                    <div
                      key={item._id ? item._id.toString() : item.slug}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col justify-between"
                    >
                      {/* Tall Scrolling Preview Container */}
                      <div className="p-3.5 pb-0">
                        <div className="relative w-full h-[420px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200/80 group-hover:border-teal-500/50 transition">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-auto object-top group-hover:object-bottom transition-all duration-[6000ms] ease-in-out"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-slate-800 via-teal-900 to-indigo-900 flex flex-col items-center justify-center p-6 text-center text-white">
                              <Layout className="w-12 h-12 mb-3 text-teal-400 opacity-80" />
                              <h4 className="font-extrabold text-sm line-clamp-2">{item.title}</h4>
                            </div>
                          )}

                          {/* Category Badge */}
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200/80 shadow-xs z-10">
                            Readymade Site
                          </span>
                        </div>
                      </div>

                      {/* Card Content & Action Buttons (Matching Screenshot UI) */}
                      <div className="p-4 space-y-3">
                        <h3 className="text-sm font-extrabold text-slate-900 text-center line-clamp-1 group-hover:text-teal-700 transition-colors">
                          {item.title}
                        </h3>

                        {/* Button Row 1: Live Preview & Setup Guide */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <a
                            href={demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] border border-teal-600/80 text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-teal-600" />
                            <span>Live Preview</span>
                          </a>

                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] border border-teal-600/80 text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                            <span>Setup Guide</span>
                          </a>
                        </div>

                        {/* Button Row 2: Buy Now Button (Full Width Teal/Indigo) */}
                        <Link
                          href={`/checkout?product=${item.slug}`}
                          onClick={(e) => handleProtectedAction(e, `/checkout?product=${item.slug}`)}
                          className="w-full py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-black text-xs text-center shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Buy Now</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Standalone Auto-Loader Spinner (Matching Reference Screenshot - No Button/Text) */}
              {hasMore && (
                <div ref={loaderRef} className="py-10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-800 stroke-[2.5]" />
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
}
