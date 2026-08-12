'use client';

import Link from 'next/link';
import { Users, Download, ShieldCheck, Headphones, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-8 pb-14 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Content (6 columns) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Top Flag Tagline */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-100/70 border border-blue-200/60 rounded-full text-xs font-semibold text-blue-800">
              <span>🇧🇩</span>
              <span>বাংলাদেশের WordPress ডেভেলপারদের জন্য</span>
            </div>

            {/* Main Headline (Always Strictly 2 Balanced Lines in Bangla & English) */}
            <h1 className="text-3xl sm:text-4xl lg:text-[45px] font-black text-slate-900 leading-[1.2] tracking-tight">
              <span className="block whitespace-nowrap">
                বাংলাদেশের <span className="text-blue-600">WordPress</span>
              </span>
              <span className="block text-blue-600 mt-1">
                Developer <span className="text-slate-900">Platform</span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
              প্রিমিয়াম প্লাগইন, থিম, টেমপ্লেট, রিসোর্স এবং বাংলা ডকুমেন্টেশন — সবকিছু এক জায়গায়।
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="#plugins"
                className="py-3.5 px-7 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-600/40 flex items-center gap-2"
              >
                <span>অল প্রোডাক্ট দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#pricing"
                className="py-3.5 px-7 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 transition shadow-xs"
              >
                প্রাইসিং দেখুন
              </Link>
            </div>

            {/* Stat Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 leading-none">5000+</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">প্রিমিয়াম মেম্বারস</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 leading-none">50K+</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">কাস্টম ডাউনলোডস</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 leading-none">99.9%</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">আপটাইম & সেফ</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 leading-none">24/7</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">সাপোর্ট সার্ভিস</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right 3D Showcase Graphic (6 columns, larger professional display) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="w-full max-w-md lg:max-w-lg mx-auto flex items-center justify-center">
              <img
                src="/hero-showcase.png"
                alt="WordPress Themes and Plugins Royal Blue Showcase"
                className="w-full h-auto object-contain hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
