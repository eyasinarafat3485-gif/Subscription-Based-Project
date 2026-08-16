'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Eye, Tag, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import DemoModal from './DemoModal';

const categories = [
  { id: 'All', label: 'All' },
  { id: 'Themes', label: 'Themes' },
  { id: 'Plugins', label: 'Plugins' },
  { id: 'eCommerce Theme', label: 'eCommerce Theme' },
  { id: 'SEO', label: 'SEO' },
  { id: 'Page Builders', label: 'Page Builders' },
  { id: 'Offer', label: 'Offer!' },
];

export default function PluginGrid({ onDownloadClick }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDemo, setSelectedDemo] = useState(null);

  const fetchProducts = async (cat = 'All') => {
    try {
      setLoading(true);
      const url = cat === 'All' ? '/api/products' : `/api/products?category=${encodeURIComponent(cat)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          // Trigger automatic seeding if database collection is empty
          const seedRes = await fetch('/api/products/seed');
          if (seedRes.ok) {
            const reFetch = await fetch(url);
            if (reFetch.ok) {
              const reData = await reFetch.json();
              setProducts(reData.products || []);
            }
          }
        }
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory]);

  return (
    <section id="plugins" className="py-12 bg-slate-50/50 border-y border-slate-100">
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
            href="/dashboard/user"
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

        {/* Product Cards Grid (5 Column Responsive) */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-semibold">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm font-medium bg-white rounded-2xl border border-slate-200 p-8">
            No products found! Add new products from the admin dashboard.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {products.map((item) => {
              const isExpired = item.offerEndsAt ? new Date(item.offerEndsAt).getTime() <= Date.now() : false;
              const isOfferActive = item.isOffer && !isExpired;
              const hasDiscount = item.regularPrice && Number(item.regularPrice) > Number(item.price);

              return (
                <div
                  key={item._id || item.slug}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                >
                  <div>
                    {/* Image Container with Badges - Height বাড়িয়ে aspect-square & object-contain করা হয়েছে */}
                    <div className="relative aspect-square w-full bg-slate-50 overflow-hidden border-b border-slate-100 flex items-center justify-center p-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          /* object-contain ব্যবহারে পুরো ছবি না কেটে স্পষ্ট দেখাবে */
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-3xl rounded-md">
                          {item.title.charAt(0)}
                        </div>
                      )}

                      {/* Category Badge */}
                      {isOfferActive ? (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm z-10">
                          Mega Offer
                        </span>
                      ) : (
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold border z-10 ${
                          (item.category || '').toLowerCase().includes('ecommerce theme')
                            ? 'bg-[#ECFEFF] text-[#0E7490] border-[#A5F3FC]'
                            : (item.category || '').toLowerCase().includes('theme')
                            ? 'bg-[#EDE9FE] text-[#5B21B6] border-[#C4B5FD]'
                            : (item.category || '').toLowerCase().includes('plugin') || 
                              (item.category || '').toLowerCase().includes('performance') ||
                              (item.category || '').toLowerCase().includes('speed') ||
                              (item.category || '').toLowerCase().includes('cache')
                            ? 'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]'
                            : (item.category || '').toLowerCase().includes('seo')
                            ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
                            : (item.category || '').toLowerCase().includes('builder')
                            ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Body Content */}
                    <div className="p-2 space-y-2 text-center">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[38px] group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[12px] text-slate-400 font-mono">
                        {item.version || 'Latest Version'}
                      </p>

                      {/* Price Display */}
                      <div className="flex items-center justify-center gap-2 pt-1">
                        {hasDiscount && (
                          <span className="text-sm text-slate-500 line-through font-semibold">
                            {item.regularPrice}৳
                          </span>
                        )}
                        <span className="text-base font-black text-blue-600 tracking-tight">
                          {item.price}৳
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Button */}
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

      </div>

      <DemoModal url={selectedDemo} onClose={() => setSelectedDemo(null)} />
    </section>
  );
}
