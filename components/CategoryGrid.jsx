'use client';

import Link from 'next/link';
import { ArrowRight, Puzzle, Palette, Layout, FolderKanban, PlaySquare, Wrench, BookOpen } from 'lucide-react';

const categories = [
  {
    name: 'প্লাগইন',
    count: '1200+ আইটেম',
    icon: Puzzle,
    slug: 'plugin',
  },
  {
    name: 'থিম',
    count: '800+ আইটেম',
    icon: Palette,
    slug: 'theme',
  },
  {
    name: 'টেমপ্লেট',
    count: '500+ আইটেম',
    icon: Layout,
    slug: 'template',
  },
  {
    name: 'রিসোর্স',
    count: '1500+ আইটেম',
    icon: FolderKanban,
    slug: 'resource',
  },
  {
    name: 'ভিডিও',
    count: '100+ আইটেম',
    icon: PlaySquare,
    slug: 'video',
  },
  {
    name: 'টুলস',
    count: '150+ আইটেম',
    icon: Wrench,
    slug: 'tool',
  },
  {
    name: 'ডকুমেন্টেশন',
    count: 'সব বাংলায় স্পষ্ট',
    icon: BookOpen,
    slug: 'documentation',
  },
];

export default function CategoryGrid({ onCategorySelect }) {
  return (
    <section className="py-10 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title Bar */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            ক্যাটাগরি অনুযায়ী ব্রাউজ করুন
          </h2>
          <Link
            href="#plugins"
            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <span>সব দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 7 Columns Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.slug}
                onClick={() => onCategorySelect && onCategorySelect(cat.slug)}
                className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-500/40 hover:-translate-y-1 transition-all group text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-xs">
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-0.5 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">{cat.count}</p>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
