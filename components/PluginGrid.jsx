'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Download, Eye } from 'lucide-react';
import DemoModal from './DemoModal';

const samplePlugins = [
  {
    id: '1',
    title: 'Elementor Pro',
    version: 'v3.20.1',
    category: 'plugin',
    rating: 4.8,
    reviewsCount: 520,
    tags: ['Page Builder', 'Popular'],
    iconBg: 'bg-red-600',
    iconText: 'E',
    demoUrl: 'https://elementor.com',
    slug: 'elementor-pro',
  },
  {
    id: '2',
    title: 'WP Rocket',
    version: 'v3.15.9',
    category: 'plugin',
    rating: 4.9,
    reviewsCount: 890,
    tags: ['Performance', 'Popular'],
    iconBg: 'bg-orange-500',
    iconText: 'WP',
    demoUrl: 'https://wp-rocket.me',
    slug: 'wp-rocket',
  },
  {
    id: '3',
    title: 'Rank Math Pro',
    version: 'v3.0.77',
    category: 'plugin',
    rating: 4.8,
    reviewsCount: 710,
    tags: ['SEO', 'Popular'],
    iconBg: 'bg-purple-600',
    iconText: 'RM',
    demoUrl: 'https://rankmath.com',
    slug: 'rank-math-pro',
  },
  {
    id: '4',
    title: 'WooCommerce',
    version: 'v8.6.2',
    category: 'plugin',
    rating: 4.7,
    reviewsCount: 940,
    tags: ['E-Commerce', 'Official'],
    iconBg: 'bg-indigo-600',
    iconText: 'Woo',
    demoUrl: 'https://woocommerce.com',
    slug: 'woocommerce-pro',
  },
  {
    id: '5',
    title: 'ACF Pro',
    version: 'v6.2.0',
    category: 'plugin',
    rating: 4.9,
    reviewsCount: 430,
    tags: ['Development', 'Official'],
    iconBg: 'bg-emerald-600',
    iconText: 'ACF',
    demoUrl: 'https://advancedcustomfields.com',
    slug: 'acf-pro',
  },
];

export default function PluginGrid({ onDownloadClick }) {
  const [selectedDemo, setSelectedDemo] = useState(null);

  return (
    <section id="plugins" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            জনপ্রিয় প্লাগইন
          </h2>
          <Link
            href="#plugins"
            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <span>সব দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 5 Column Plugin Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {samplePlugins.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header Icon & Title */}
                <div className="flex items-start gap-3.5 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${plugin.iconBg} text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    {plugin.iconText}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                      {plugin.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{plugin.version}</p>
                  </div>
                </div>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-1.5 mb-3 text-xs text-slate-600">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-800">{plugin.rating}</span>
                  <span className="text-slate-400">({plugin.reviewsCount})</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {plugin.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onDownloadClick && onDownloadClick(plugin)}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড</span>
                </button>
                <button
                  onClick={() => setSelectedDemo(plugin.demoUrl)}
                  className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-[11px] rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span>লাইভ ডেমো</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      <DemoModal url={selectedDemo} onClose={() => setSelectedDemo(null)} />
    </section>
  );
}
