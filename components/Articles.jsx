'use client';

import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';

const articles = [
  {
    title: 'Elementor Pro ইনস্টল এবং অ্যাক্টিভেট করার নিয়ম',
    category: 'গাইড',
    categoryBg: 'bg-blue-600',
    date: '০৪ মে, ২০২৪',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
  },
  {
    title: 'WooCommerce স্টোরের স্পিড অপটিমাইজেশন',
    category: 'টিউটোরিয়াল',
    categoryBg: 'bg-indigo-600',
    date: '০১ মে, ২০২৪',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80',
  },
  {
    title: 'Rank Math SEO সেটআপ সম্পূর্ণ গাইড',
    category: 'টিপস',
    categoryBg: 'bg-cyan-600',
    date: '২৮ এপ্রিল, ২০২৪',
    thumbnail: 'https://images.unsplash.com/photo-1572177812156-58036aae439c?w=400&auto=format&fit=crop&q=80',
  },
  {
    title: 'Flatsome Theme Customization পার্ট ৩',
    category: 'রিভিউ',
    categoryBg: 'bg-sky-600',
    date: '২৫ এপ্রিল, ২০২৪',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80',
  },
];

export default function Articles() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            সাম্প্রতিক আর্টিকেল
          </h2>
          <Link
            href="#articles"
            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <span>সব আর্টিকেল</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {articles.map((art, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-blue-300 transition group flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Image Container */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={art.thumbnail}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-1 ${art.categoryBg} text-white text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm`}
                  >
                    {art.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 mb-3">
                    {art.title}
                  </h3>
                </div>
              </div>

              {/* Date Metadata */}
              <div className="px-4 pb-4 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium border-t border-slate-50 pt-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{art.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
