'use client';

import Link from 'next/link';
import { ArrowRight, Puzzle, Palette, Layout, FolderKanban, PlaySquare, Wrench, Crown } from 'lucide-react';

const categories = [
  {
    name: 'All items',
    count: '3000+ Items',
    icon: PlaySquare,
    href: '/resources',
  },
  {
    name: 'Plugins',
    count: '1000+ Items',
    icon: Puzzle,
    href: '/product-category/wordpress-plugins',
  },
  {
    name: 'Themes',
    count: '600+ Items',
    icon: Palette,
    href: '/product-category/wordpress-themes',
  },
  {
    name: 'SEO Tools',
    count: '50+ Items',
    icon: Wrench,
    href: '/product-category/seo-tools',
  },
  {
    name: 'Templates',
    count: '500+ Items',
    icon: Layout,
    href: '/templates',
  },
  {
    name: 'Resources',
    count: '1100+ Items',
    icon: FolderKanban,
    href: '/resources',
  },
  {
    name: 'Membership',
    count: 'VIP Access',
    icon: Crown,
    href: '/membership',
  },
];

export default function CategoryGrid({ onCategorySelect }) {
  // Duplicate categories list to create a 100% continuous infinite loop marquee for all screen sizes
  const marqueeCategories = [...categories, ...categories, ...categories];

  return (
    <section className="py-10 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Title Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            Browse by Category
          </h2>
          <Link
            href="/resources"
            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ALL DEVICES: Portfolio-Style Continuous Auto Marquee Carousel (Pauses on Hover/Touch) */}
        <div className="overflow-hidden relative rounded-3xl py-2">
          {/* Fade Edge Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee gap-3 md:gap-5 py-2 hover:[animation-play-state:paused] active:[animation-play-state:paused]">
            {marqueeCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={`${cat.name}-${idx}`}
                  href={cat.href}
                  onClick={() => onCategorySelect && onCategorySelect(cat.href)}
                  className="flex flex-col items-center justify-center p-3 md:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xl hover:border-blue-500/50 hover:-translate-y-1 transition-all text-center shrink-0 w-[115px] md:w-[165px] cursor-pointer group select-none"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 md:mb-3 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs group-hover:scale-105">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 stroke-[2]" />
                  </div>
                  <h3 className="text-[10px] md:text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-0.5 group-hover:text-blue-600 transition-colors whitespace-nowrap truncate max-w-[100px] md:max-w-[140px]">
                    {cat.name}
                  </h3>
                  <p className="text-[9px] md:text-[11px] text-slate-400 font-semibold whitespace-nowrap truncate max-w-[100px] md:max-w-[140px]">
                    {cat.count}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
