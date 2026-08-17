'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
  Sparkles,
  SlidersHorizontal,
  FolderKanban,
  CheckCircle2
} from 'lucide-react';

const CATEGORY_MAP = {
  'wordpress-plugins': { title: 'WordPress Plugins', defaultCat: 'Plugins' },
  'wordpress-themes': { title: 'WordPress Themes', defaultCat: 'Themes' },
  'seo-tools': { title: 'SEO Tools', defaultCat: 'SEO' },
  'landing-pages': { title: 'Landing Pages', defaultCat: 'Page Builders' },
  'resources': { title: 'WordPress Resources', defaultCat: 'Resources' },
};

const SIDEBAR_CATEGORIES = [
  {
    name: 'WordPress Plugins',
    slug: 'Plugins',
    subcategories: [
      { name: 'All Plugins', slug: 'Plugins' },
      { name: 'WooCommerce Plugins', slug: 'WooCommerce' },
      { name: 'Elementor Addons', slug: 'Page Builders' },
      { name: 'SEO Plugins', slug: 'SEO' },
      { name: 'Security & Backup', slug: 'Security' },
      { name: 'Speed & Cache', slug: 'Performance' },
    ],
  },
  {
    name: 'WordPress Themes',
    slug: 'Themes',
    subcategories: [
      { name: 'All Themes', slug: 'Themes' },
      { name: 'Multipurpose Themes', slug: 'Multipurpose' },
      { name: 'E-commerce Themes', slug: 'WooCommerce' },
      { name: 'Blog & Magazine', slug: 'Blog' },
      { name: 'Business & Agency', slug: 'Business' },
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
  {
    name: 'WordPress Resources',
    slug: 'Resources',
    subcategories: [
      { name: 'All Resources', slug: 'Resources' },
      { name: 'GFX & UI Bundles', slug: 'Resources' },
    ],
  },
];

export default function CategoryPage({ params }) {
  const resolvedParams = use(params);
  const rawCategorySlug = resolvedParams.category;

  const categoryMeta = CATEGORY_MAP[rawCategorySlug] || {
    title: rawCategorySlug ? rawCategorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All Products',
    defaultCat: 'All',
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubcat, setSelectedSubcat] = useState(categoryMeta.defaultCat);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCats, setExpandedCats] = useState({
    'Plugins': true,
    'Themes': true,
    'SEO': true,
  });

  const toggleExpand = (catSlug) => {
    setExpandedCats((prev) => ({ ...prev, [catSlug]: !prev[catSlug] }));
  };

  // Fetch products based on category/subcategory & search filter
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        let url = `/api/products?limit=50`;

        if (selectedSubcat && selectedSubcat !== 'All') {
          url += `&category=${encodeURIComponent(selectedSubcat)}`;
        }
        if (searchQuery.trim()) {
          url += `&search=${encodeURIComponent(searchQuery.trim())}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Error fetching category products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [selectedSubcat, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans flex flex-col justify-between">
      <div>
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Top Banner Notice Bar (Matching Reference Image 1) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left: Category Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Menu className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {categoryMeta.title}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {products.length} Products Available
                </p>
              </div>
            </div>

            {/* Right: Download For FREE Promo Box (Indigo Blue Theme) */}
            <div className="w-full md:w-auto bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-blue-50/80 border border-dashed border-indigo-300/90 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-100/90 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-indigo-900 tracking-tight">
                    Download For FREE
                  </h3>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                    Get this product FREE + access to all premium products for just <strong className="text-indigo-600 font-black">৳ 499 /- Monthly</strong>.
                  </p>
                </div>
              </div>

              <Link
                href="/membership"
                className="px-4 py-2.5 bg-white hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 font-black text-xs rounded-xl border border-indigo-200 shadow-2xs transition flex items-center gap-1.5 shrink-0 hover:scale-102"
              >
                <span>Get Membership</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* Main Content Layout: Compact Left Sidebar Filter + Expanded Right Product Grid */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start pt-2">

            {/* Compact Left Sidebar Filter (Fixed Width - Matching Image 2) */}
            <aside className="w-full lg:w-60 xl:w-64 shrink-0 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6">
              
              {/* Search Box */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search theme & plugin..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Browse By Categories Tree List (Matching Image 2) */}
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
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left font-bold transition ${selectedSubcat === catGroup.slug
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
                                  className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-between ${isSubActive
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

            {/* Expanded Right Product Grid */}
            <div className="flex-1 min-w-0 space-y-6">
              
              {loading ? (
                <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                  <p className="text-xs font-extrabold text-slate-500">
                    Loading products...
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
                  <FolderKanban className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-base font-black text-slate-800">
                    No products found in this category
                  </h3>
                  <p className="text-xs text-slate-500">
                    Try selecting a different category from the sidebar or clear your search term.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSubcat('All');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    View All Products
                  </button>
                </div>
              ) : (
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
                          {/* Image Container with Backdrop & Category Badge */}
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
                                  {regPriceVal}৳
                                </span>
                              )}
                              <span className="text-base font-black text-indigo-600 tracking-tight">
                                {priceVal}৳
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Action Buttons (With Single Line Guarantee) */}
                        <div className="p-3 pt-0 grid grid-cols-2 gap-1.5">
                          <Link
                            href={`/products/${item.slug}`}
                            className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200/90 shadow-2xs transition flex items-center justify-center gap-1 whitespace-nowrap min-w-0"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            <span>Details</span>
                          </Link>

                          <Link
                            href={`/checkout?product=${item.slug}`}
                            className="py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs shadow-indigo-500/20 transition flex items-center justify-center gap-1 whitespace-nowrap min-w-0"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                            <span>Buy Now</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
}
