'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { ArrowRight, ShoppingBag, Eye, Tag, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import DemoModal from './DemoModal';
import ConfirmDownloadModal from './ConfirmDownloadModal';

const categories = [
  { id: 'All', label: 'All' },
  { id: 'Themes', label: 'Themes' },
  { id: 'Plugins', label: 'Plugins' },
  { id: 'SEO', label: 'SEO' },
  { id: 'Page Builders', label: 'Page Builders' },
  { id: 'Offer', label: 'Offer!' },
];

export default function PluginGrid({ onDownloadClick }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [failedImages, setFailedImages] = useState({});
  const [userMembership, setUserMembership] = useState(null);
  const [selectedProductForDownload, setSelectedProductForDownload] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.membership && (data.user.membership.status === 'active' || !data.user.membership.status)) {
            setUserMembership(data.user.membership);
          } else {
            setUserMembership(null);
          }
        }
      } catch (err) { }
    };
    if (session?.user) {
      fetchUser();
    }
    const handleProfileUpdate = () => fetchUser();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [session]);

  const handleBuyNowClick = (e, item) => {
    if (session?.user && userMembership && (userMembership.status === 'active' || !userMembership.status)) {
      e.preventDefault();
      setSelectedProductForDownload(item);
      setIsConfirmModalOpen(true);
    }
  };

  const handleProtectedAction = (e, targetUrl) => {
    // Guest users and logged-in users can view product details freely
  };

  const LIMIT = 20; // 4 rows * 5 columns = 20 products per batch

  const handleImageError = (id) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const fetchProducts = async (cat = 'All', pageNum = 1, isAppend = false) => {
    try {
      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const limitVal = cat === 'All' ? 10 : 15;
      const url = `/api/products?page=${pageNum}&limit=${limitVal}${cat !== 'All' ? `&category=${encodeURIComponent(cat)}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let fetchedProducts = data.products || [];

        if (fetchedProducts.length === 0 && pageNum === 1) {
          // Trigger automatic seeding if database collection is empty
          const seedRes = await fetch('/api/products/seed');
          if (seedRes.ok) {
            const reFetch = await fetch(url);
            if (reFetch.ok) {
              const reData = await reFetch.json();
              fetchedProducts = reData.products || [];
            }
          }
        }

        if (isAppend) {
          setProducts((prev) => {
            const getKey = (p) => (p._id ? p._id.toString() : p.slug);
            const existingKeys = new Set(prev.map(getKey));
            const uniqueNew = fetchedProducts.filter((p) => {
              const k = getKey(p);
              return k && !existingKeys.has(k);
            });
            return [...prev, ...uniqueNew];
          });
        } else {
          setProducts(fetchedProducts);
        }

        setPage(pageNum);
        const totalPages = data.totalPages || 1;
        setHasMore(cat !== 'All' && pageNum < totalPages);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(activeCategory, 1, false);
  }, [activeCategory]);

  const handleViewMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(activeCategory, page + 1, true);
    }
  };

  return (
    <section id="plugins" className="py-12 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header & Section Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Popular WordPress Themes & Plugins</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Developers Club's genuine virus-free WordPress themes and plugins collection
            </p>
          </div>

          <Link
            href="/resources"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Qulabi-style Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 border ${isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                {cat.id === 'Offer' && <Sparkles className="w-3.5 h-3.5 inline mr-1 text-amber-300 animate-pulse" />}
                {cat.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="w-full py-16 sm:py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-sm font-bold text-slate-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="w-full py-16 text-center text-slate-500 text-sm font-semibold bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            No products found! Add new products from the admin dashboard.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {products.map((item, index) => {
                const isExpired = item.offerEndsAt ? new Date(item.offerEndsAt).getTime() <= Date.now() : false;
                const isOfferActive = item.isOffer && !isExpired;
                const hasDiscount = item.regularPrice && Number(item.regularPrice) > Number(item.price);

                return (
                  <div
                    key={item._id ? `${item._id.toString()}-${index}` : `${item.slug || 'product'}-${index}`}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                  >
                    <div>
                      {/* Image Container with Badges - Dynamic Ambient Blur & Standardized Aspect Ratio */}
                      <div className="relative aspect-square w-full bg-slate-100/70 overflow-hidden border-b border-slate-100 flex items-center justify-center p-3">
                        {item.image && !failedImages[item._id || item.slug] ? (
                          <>
                            {/* Ambient Color Backdrop for Non-Square Photos */}
                            <img
                              src={item.image}
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-125 pointer-events-none select-none"
                            />
                            {/* Crisp Foreground Product Graphic */}
                            <img
                              src={item.image}
                              alt={item.title}
                              onError={() => handleImageError(item._id || item.slug)}
                              className="relative z-10 max-w-full max-h-full object-contain filter drop-shadow-xs transition-transform duration-500 group-hover:scale-105"
                            />
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-3xl shadow-inner">
                            {item.title ? item.title.charAt(0).toUpperCase() : 'P'}
                          </div>
                        )}

                        {/* Category Badge */}
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold border z-10 ${isOfferActive || (item.category || '').toLowerCase().includes('offer') || (item.category || '').toLowerCase().includes('bundle')
                          ? 'bg-red-600 text-white border-red-700 font-black uppercase tracking-wider shadow-xs'
                          : (item.category || '').toLowerCase().includes('theme')
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : (item.category || '').toLowerCase().includes('plugin') ||
                              (item.category || '').toLowerCase().includes('performance') ||
                              (item.category || '').toLowerCase().includes('speed') ||
                              (item.category || '').toLowerCase().includes('cache')
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : (item.category || '').toLowerCase().includes('seo')
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : (item.category || '').toLowerCase().includes('builder') ||
                                  (item.category || '').toLowerCase().includes('page builder')
                                  ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                          {isOfferActive ? 'Offer' : item.category}
                        </span>
                      </div>

                      {/* Body Content */}
                      <div className="p-3 space-y-2 text-center">
                        <Link href={`/products/${item.slug}`} className="block">
                          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[38px] group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-[12px] text-slate-400 font-mono">
                          {item.version || 'Latest Version'}
                        </p>

                        {/* Price Display */}
                        <div className="flex items-center justify-center gap-2 pt-1">
                          {hasDiscount && (
                            <span className="text-sm text-slate-400 line-through font-semibold">
                              {item.regularPrice}৳
                            </span>
                          )}
                          <span className="text-base font-black text-indigo-600 tracking-tight">
                            {item.price}৳
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Action Buttons (Details & Buy Now) */}
                    <div className="p-3 pt-0 grid grid-cols-2 gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={(e) => handleProtectedAction(e, `/products/${item.slug}`)}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200/90 shadow-2xs transition flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>Details</span>
                      </Link>

                      <Link
                        href={`/checkout?product=${item.slug}`}
                        onClick={(e) => handleBuyNowClick(e, item)}
                        className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs shadow-indigo-500/20 transition flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{userMembership ? 'Download' : 'Buy Now'}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View More Button (Matches User Screenshot Style) */}
            {hasMore && (
              <div className="pt-2">
                <button
                  onClick={handleViewMore}
                  disabled={loadingMore}
                  className="w-full py-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl text-indigo-600 hover:text-indigo-700 font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin text-indigo-600" />
                      <span>Loading products...</span>
                    </>
                  ) : (
                    <>
                      <span>View More</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      <ConfirmDownloadModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        product={selectedProductForDownload}
        userMembership={userMembership}
      />

      <DemoModal url={selectedDemo} onClose={() => setSelectedDemo(null)} />
    </section>
  );
}
