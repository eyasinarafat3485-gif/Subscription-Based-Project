'use client';

import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

const testimonials = [
  {
    quote: '"বাংলা ডকুমেন্টেশন এবং সাপোর্টের জন্য Developers Club সেরা! ফ্রন্টএন্ডের জন্য ক্লায়েন্ট প্রজেক্ট করা এখন অনেক সহজ।"',
    name: 'রাফিক হোসেন',
    role: 'Web Developer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    quote: '"একটি সাবস্ক্রিপশনে এত প্রিমিয়াম প্লাগইন পাওয়া সত্যিই অবিশ্বাস্য! নিয়মিত ফাইল আপডেট অসাধারণ।"',
    name: 'মেহেদী হাসান',
    role: 'Digital Marketer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    quote: '"বাংলায় সাপোর্ট এবং ২৪/৭ রেসপন্স অনেক হেল্পফুল। নতুন ক্লায়েন্ট কাজ পাওয়া মাত্রই প্রয়োজন শেষ।"',
    name: 'ফারিহা ইসলাম',
    role: 'WordPress Developer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            আমাদের সদস্যরা যা বলছেন
          </h2>
          <Link
            href="#reviews"
            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <span>সব রিভিউ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-6 italic">
                  {t.quote}
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{t.name}</h3>
                  <p className="text-[10px] text-slate-400 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
