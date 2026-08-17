'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DemoModal from '@/components/DemoModal';
import {
  ArrowRight,
  ShoppingBag,
  Eye,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  Sparkles,
  Home,
  ChevronRight,
  LayoutGrid,
  Layers,
  FolderOpen
} from 'lucide-react';

const SUBCATEGORY_MAP = {
  'wordpress-themes': [
    { id: 'All', label: 'All Themes' },
    { id: 'E-Commerce', label: 'E-Commerce' },
    { id: 'LMS & Education', label: 'Educational LMS' },
    { id: 'Multipurpose', label: 'Multipurpose' },
    { id: 'News & Magazine', label: 'News & Magazine' },
    { id: 'Portfolio & Creative', label: 'Portfolio & Creative' },
    { id: 'Business & Agency', label: 'Business & Agency' }
  ],
  'wordpress-plugins': [
    { id: 'All', label: 'All Plugins' },
    { id: 'SEO', label: 'SEO Plugins' },
    { id: 'Security & Backup', label: 'Backup & Security' },
    { id: 'Page Builders', label: 'Page Builders' },
    { id: 'Performance', label: 'Speed & Cache' },
    { id: 'E-Commerce', label: 'WooCommerce Plugins' }
  ],
  'woocommerce-plugins': [
    { id: 'All', label: 'All WooCommerce' },
    { id: 'Cart & Checkout', label: 'Cart & Checkout' },
    { id: 'Product Search', label: 'Search & Bundles' },
    { id: 'Memberships', label: 'Subscriptions' }
  ],
  'seo-plugins': [
    { id: 'All', label: 'All SEO Plugins' },
    { id: 'RankMath', label: 'Rank Math' },
    { id: 'Yoast', label: 'Yoast SEO' },
    { id: 'Schema', label: 'Schema & Snippets' }
  ],
  'page-builders': [
    { id: 'All', label: 'All Builders' },
    { id: 'Elementor', label: 'Elementor & Addons' },
    { id: 'Divi', label: 'Divi Builder' },
    { id: 'Bricks', label: 'Bricks & Gutenberg' }
  ]
};

const DEFAULT_SUBCATEGORIES = [
  { id: 'All', label: 'All' },
  { id: 'Popular', label: 'Popular' },
  { id: 'Offer', label: 'Offers' }
];

export default function CategoryPage({ params }) {
  // Handle Next.js 15/16 params Promise
  const resolvedParams = use(params);
  const categorySlug = resolvedParams?.category || 'wordpress-themes';

  // Format readable category title
  const formatTitle = (slug) => {
    if (slug === 'wordpress-themes') return 'WordPress Themes';
    if (slug === 'wordpress-plugins') return 'WordPress Plugins';
    if (slug === 'woocommerce-plugins') return 'WooCommerce Plugins';
    if (slug === 'seo-plugins') return 'SEO Plugins';
    if (slug === 'page-builders') return 'Page Builder Themes & Addons';
    return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const title = formatTitle(categorySlug);

  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [sortOption, setSortOption] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [failedImages, setFailedImages] = useState({});

  const LIMIT = 15; // 3 rows * 5 columns

  const subcategories = SUBCATEGORY_MAP[categorySlug] || DEFAULT_SUBCATEGORIES;

  // Handle image load failures fallback
  const handleImageError = (id) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when category/subcategory/sort changes
  useEffect(() => {
    setPage(1);
  }, [categorySlug, activeSubcategory, sortOption]);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/api/products?category=${encodeURIComponent(categorySlug)}&page=${page}&limit=${LIMIT}&sort=${sortOption}`;

      if (activeSubcategory !== 'All') {
        url += `&subcategory=${encodeURIComponent(activeSubcategory)}`;
      }

      if (debouncedSearch.trim()) {
        url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.totalProducts || (data.products ? data.products.length : 0));
      }
    } catch (err) {
      console.error('Category products fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categorySlug, activeSubcategory, sortOption, debouncedSearch, page]);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        <Header />

        <main className="pb-16">
          {/* Hero Category Banner & Breadcrumbs Header */}
          <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Glow Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-6 relative z-10">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Link href="/" className="hover:text-blue-400 transition flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-slate-300 font-bold">Categories</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-blue-400 font-bold">{title}</span>
              </nav>

              {/* Title & Description Container */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-extrabold tracking-wide uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    <span>Developers Club Verified</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                    {title}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                    Explore our handpicked, virus-free collection of authentic {title.toLowerCase()}.
                    Instant download, regular updates & premium support included.
                  </p>
                </div>

                {/* Counter & Search Box */}
                <div className="w-full md:w-80 shrink-0 space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={`Search in ${title}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Filter & Products Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">

            {/* Sub-category Tabs & Controls Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">

              {/* Subcategory Pills Navigation */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                {subcategories.map((sub) => {
                  const isActive = activeSubcategory === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubcategory(sub.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 border ${isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>

              {/* Info Count & Sort Controls */}
              <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <span className="text-xs text-slate-500 font-semibold shrink-0">
                  Showing <strong className="text-slate-900">{totalProducts}</strong> items
                </span>

                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-xs font-bold text-slate-600 hidden sm:inline">
                    Sort:
                  </label>
                  <div className="relative">
                    <select
                      id="sort"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition cursor-pointer"
                    >
                      <option value="latest">Latest Released</option>
                      <option value="popular">Most Popular</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

            </div>

            {/* Product Cards Grid Section */}
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500 bg-white rounded-2xl border border-slate-200">
                <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
                <p className="text-sm font-semibold">Fetching {title}...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find any products matching your selected filter or search term. Try resetting your search.
                </p>
                <button
                  onClick={() => {
                    setActiveSubcategory('All');
                    setSearchTerm('');
                  }}
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {products.map((item, index) => {
                  const isExpired = item.offerEndsAt ? new Date(item.offerEndsAt).getTime() <= Date.now() : false;
                  const isOfferActive = item.isOffer && !isExpired;
                  const hasDiscount = item.regularPrice && Number(item.regularPrice) > Number(item.price);

                  return (
                    <div
                      key={item._id ? `${item._id.toString()}-${index}` : `${item.slug}-${index}`}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                    >
                      <div>
                        {/* Image Container with Ambient Backdrop & Aspect Square */}
                        <div className="relative aspect-square w-full bg-slate-100/80 overflow-hidden border-b border-slate-100 flex items-center justify-center p-3">
                          {item.image && !failedImages[item._id || item.slug] ? (
                            <>
                              {/* Soft ambient blur backdrop */}
                              <img
                                src={item.image}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-125 pointer-events-none select-none"
                              />
                              {/* Main Product Image */}
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
                          <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold border z-10 ${isOfferActive || (item.category || '').toLowerCase().includes('offer')
                              ? 'bg-red-600 text-white border-red-700 font-black uppercase tracking-wider shadow-xs'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}>
                            {isOfferActive ? 'Offer' : item.category || 'Theme'}
                          </span>

                          {/* Quick Live Preview Button Overlay */}
                          {item.demoUrl && item.demoUrl !== '#' && (
                            <button
                              onClick={() => setSelectedDemo(item.demoUrl)}
                              className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-blue-600 text-white p-1.5 rounded-lg text-xs font-bold transition opacity-0 group-hover:opacity-100 z-20 backdrop-blur-xs flex items-center gap-1 shadow-md"
                              title="Live Demo Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Card Body Info */}
                        <div className="p-3 space-y-2 text-center">
                          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[38px] group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {item.version || 'Latest Version'}
                          </p>

                          {/* Price Tag */}
                          <div className="flex items-center justify-center gap-2 pt-1">
                            {hasDiscount && (
                              <span className="text-xs text-slate-400 line-through font-semibold">
                                {item.regularPrice}৳
                              </span>
                            )}
                            <span className="text-base font-black text-blue-600 tracking-tight">
                              {item.price}৳
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Buy Action Footer */}
                      <div className="p-3 pt-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Buy Now</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Control Bar */}
            {totalPages > 1 && (
              <div className="pt-8 flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition border ${page === pageNum
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
                >
                  Next
                </button>
              </div>
            )}

          </section>
        </main>
      </div>

      <Footer />

      {/* Demo Modal for Live Preview */}
      {selectedDemo && (
        <DemoModal url={selectedDemo} onClose={() => setSelectedDemo(null)} />
      )}
    </div>
  );
}
