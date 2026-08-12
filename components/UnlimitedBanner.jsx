'use client';

import Link from 'next/link';
import { Gift, ArrowRight } from 'lucide-react';

export default function UnlimitedBanner() {
  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#07132B] rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Icon & Text */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
              <Gift className="w-8 h-8 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">
                একটি সদস্যপদ, সবকিছু আনলিমিটেড!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                একবার মেম্বারশিপ নিন এবং 5000+ প্রোডাক্টে আনলিমিটেড অ্যাক্সেস করুন
              </p>
            </div>
          </div>

          {/* Right Action Button */}
          <Link
            href="#pricing"
            className="py-3.5 px-7 bg-white hover:bg-slate-100 text-blue-900 font-bold text-sm rounded-xl transition shadow-md shrink-0 flex items-center gap-2"
          >
            <span>মেম্বারশিপ প্ল্যান দেখুন</span>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </Link>

        </div>
      </div>
    </section>
  );
}
