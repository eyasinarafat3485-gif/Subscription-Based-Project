'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryBannerCTA from '@/components/CategoryBannerCTA';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Gift,
  ArrowRight,
  ShoppingBag,
  Eye,
  Loader2,
  Menu,
  SlidersHorizontal,
  FolderKanban,
  CheckCircle2
} from 'lucide-react';

const SIDEBAR_CATEGORIES = [
  {
    name: 'WordPress Resources',
    slug: 'Resources',
    subcategories: [
      { name: 'All Resources', slug: 'Resources' },
    ],
  },
  {
    name: 'WordPress Themes',
    slug: 'Themes',
    subcategories: [
      { name: 'All Themes', slug: 'Themes' },
      { name: 'Blog Themes', slug: 'Blog' },
      { name: 'Corporate & Service', slug: 'Business' },
      { name: 'Directories & Listings', slug: 'Business' },
      { name: 'Ecommerce Themes', slug: 'WooCommerce' },
      { name: 'Educational LMS Themes', slug: 'Multipurpose' },
      { name: 'Multipurpose Themes', slug: 'Multipurpose' },
      { name: 'Portfolio & Creative', slug: 'Multipurpose' },
      { name: 'Real Estate Themes', slug: 'Business' },
    ],
  },
  {
    name: 'WordPress Plugins',
    slug: 'Plugins',
    subcategories: [
      { name: 'All Plugins', slug: 'Plugins' },
      { name: 'E-Commerce Plugins', slug: 'WooCommerce' },
      { name: 'Form Builders Plugin', slug: 'Plugins' },
      { name: 'Page Builder Plugins', slug: 'Page Builders' },
      { name: 'Add-Ons', slug: 'Page Builders' },
      { name: 'SEO Plugins', slug: 'SEO' },
      { name: 'Backup & Security', slug: 'Security' },
      { name: 'Speed & Performance', slug: 'Performance' },
      { name: 'LMS Plugins', slug: 'Plugins' },
    ],
  },
  {
    name: 'SEO Tools & Utilities',
    slug: 'SEO',
    subcategories: [
      { name: 'All SEO Tools', slug: 'SEO' },
      { name: 'Rank Math & Yoast', slug: 'SEO' },
      { name: 'Schema & Indexing', slug: 'SEO' },
    ],
  },
  {
    name: 'Landing Pages & Templates',
    slug: 'Page Builders',
    subcategories: [
      { name: 'All Templates', slug: 'Page Builders' },
      { name: 'Elementor Kits', slug: 'Page Builders' },
    ],
  },
];

import ConfirmDownloadModal from '@/components/ConfirmDownloadModal';

function ResourcesContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedSubcat, setSelectedSubcat] = useState('All');
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [userMembership, setUserMembership] = useState(null);
  const [selectedProductForDownload, setSelectedProductForDownload] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState({
    'Resources': true,
    'Themes': true,
    'Plugins': true,
    'SEO': true,
  });

  const BATCH_SIZE = 16;

  useEffect(() => {
    document.title = 'Resources | Developers Club';
  }, []);

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

  // Sync search input if URL search param changes
  useEffect(() => {
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  const toggleExpand = (catSlug) => {
    setExpandedCats((prev) => ({ ...prev, [catSlug]: !prev[catSlug] }));
  };

  const handleProtectedAction = (e, targetUrl) => {
    // Guest users and logged-in users can view product details freely
  };

  // Fetch products (16 items batch) based on category, title, slug & search filter
  const fetchCategoryProducts = async (pageNum = 1, isAppend = false) => {
    try {
      if (isAppend) {
        setLoadingMore(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } else {
        setLoading(true);
      }

      let url = `/api/products?page=${pageNum}&limit=${BATCH_SIZE}`;

      if (selectedSubcat && selectedSubcat !== 'All' && selectedSubcat !== 'Resources') {
        url += `&category=${encodeURIComponent(selectedSubcat)}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const newItems = data.products || [];
        setTotalProducts(data.totalProducts || newItems.length);

        if (isAppend) {
          setProducts((prev) => [...prev, ...newItems]);
        } else {
          setProducts(newItems);
        }

        setHasMore(pageNum < (data.totalPages || 1));
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loaderRef = useRef(null);

  useEffect(() => {
    setPage(1);
    fetchCategoryProducts(1, false);
  }, [selectedSubcat, searchQuery]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCategoryProducts(nextPage, true);
  };

  // Auto-trigger next 16 items loading when scrolled near bottom
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
  }, [hasMore, loadingMore, loading, page, selectedSubcat, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans flex flex-col justify-between">
      <div>
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Top Banner Notice Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Left: Section Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Menu className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 'WordPress Resources'}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {products.length} Products Available
                </p>
              </div>
            </div>

            {/* Right: Dynamic Promo Box OR Active Membership Countdown Box */}
            <CategoryBannerCTA />

          </div>

          {/* Main Layout: Left Sidebar + Right Product Grid */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start pt-2">

            {/* Compact Left Sidebar Filter */}
            <aside className="w-full lg:w-60 xl:w-64 shrink-0 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6">

              {/* Search Box */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search theme, plugin, slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Browse By Categories Tree List */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Browse By Categories
                  </h2>
                </div>

                <div className="space-y-1 text-xs">
                  {SIDEBAR_CATEGORIES.map((catGroup) => {
                    const isExpanded = expandedCats[catGroup.slug] !== false;
                    const hasSubcats = catGroup.subcategories && catGroup.subcategories.length > 0;

                    return (
                      <div key={catGroup.name} className="space-y-1">
                        {/* Parent Category Header */}
                        <button
                          onClick={() => {
                            setSelectedSubcat(catGroup.slug);
                            if (hasSubcats) toggleExpand(catGroup.slug);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left font-bold transition cursor-pointer ${selectedSubcat === catGroup.slug
                            ? 'bg-indigo-50 text-indigo-600 font-extrabold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                            }`}
                        >
                          <span className="truncate">{catGroup.name}</span>
                          {hasSubcats && (
                            <span className="text-slate-400">
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </span>
                          )}
                        </button>

                        {/* Subcategories Dropdown */}
                        {hasSubcats && isExpanded && (
                          <div className="pl-4 space-y-1 border-l-2 border-slate-100 ml-3 my-1">
                            {catGroup.subcategories.map((sub) => {
                              const isSubActive = selectedSubcat === sub.slug;
                              return (
                                <button
                                  key={sub.name}
                                  onClick={() => setSelectedSubcat(sub.slug)}
                                  className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-between cursor-pointer ${isSubActive
                                    ? 'text-indigo-600 font-extrabold bg-indigo-50/60'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                >
                                  <span>{sub.name}</span>
                                  {isSubActive && <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </aside>

            <div className="flex-1 min-w-0 space-y-6 w-full">

              {loading ? (
                <div className="w-full py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                  <p className="text-xs font-extrabold text-slate-500">
                    Loading products...
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
                  <FolderKanban className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-base font-black text-slate-800">
                    No products found matching "{searchQuery}"
                  </h3>
                  <p className="text-xs text-slate-500">
                    Try searching with another keyword or clear your search query.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
                    {products.map((item) => {
                      const priceVal = item.price || 299;
                      const regPriceVal = item.regularPrice || 899;
                      const hasDiscount = regPriceVal > priceVal;

                      return (
                        <div
                          key={item._id ? item._id.toString() : item.slug}
                          className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                        >
                          <div>
                            {/* Image Container */}
                            <div className="relative aspect-square w-full bg-slate-100/70 overflow-hidden border-b border-slate-100 flex items-center justify-center p-3">
                              {item.image ? (
                                <>
                                  <img
                                    src={item.image}
                                    alt=""
                                    aria-hidden="true"
                                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-125 pointer-events-none select-none"
                                  />
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="relative z-10 max-w-full max-h-full object-contain filter drop-shadow-xs transition-transform duration-500 group-hover:scale-105"
                                  />
                                </>
                              ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-3xl shadow-inner">
                                  {item.title ? item.title.charAt(0).toUpperCase() : 'P'}
                                </div>
                              )}

                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold border z-10 bg-indigo-50 text-indigo-700 border-indigo-200">
                                {item.category || 'Plugin'}
                              </span>
                            </div>

                            {/* Body Content */}
                            <div className="p-3 space-y-2 text-center">
                              <Link
                                href={`/products/${item.slug}`}
                                onClick={(e) => handleProtectedAction(e, `/products/${item.slug}`)}
                                className="block"
                              >
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
                                    {regPriceVal}৳
                                  </span>
                                )}
                                <span className="text-base font-black text-indigo-600 tracking-tight">
                                  {priceVal}৳
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Footer Action Buttons */}
                          <div className="p-3 pt-0 grid grid-cols-2 gap-1.5">
                            <Link
                              href={`/products/${item.slug}`}
                              onClick={(e) => handleProtectedAction(e, `/products/${item.slug}`)}
                              className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200/90 shadow-2xs transition flex items-center justify-center gap-1 whitespace-nowrap min-w-0"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                              <span>Details</span>
                            </Link>

                            <Link
                              href={`/checkout?product=${item.slug}`}
                              onClick={(e) => handleBuyNowClick(e, item)}
                              className="py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs shadow-indigo-500/20 transition flex items-center justify-center gap-1 whitespace-nowrap min-w-0"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                              <span>{userMembership ? 'Download' : 'Buy Now'}</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Auto-Loader Spinner */}
                  {hasMore && (
                    <div ref={loaderRef} className="py-10 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-slate-800 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

        </main>

        <ConfirmDownloadModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          product={selectedProductForDownload}
          userMembership={userMembership}
        />
      </div>

      <Footer />
    </div>
  );
}

export default function ResourcesClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <ResourcesContent />
    </Suspense>
  );
}
