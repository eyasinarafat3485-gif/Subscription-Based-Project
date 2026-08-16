'use client';

import Link from 'next/link';
import { Users, Download, ShieldCheck, Headphones, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative pt-8 pb-14 overflow-hidden bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Content (6 columns) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Top Flag Tagline with professional animations */}
            <div className="relative overflow-hidden inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-100/70 border border-blue-200/60 rounded-full text-xs font-semibold text-blue-800">
              {/* Shiny animated border line sweep */}
              <motion.div
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent -skew-x-12 pointer-events-none"
                initial={{ left: '-100%' }}
                animate={{ left: '200%' }}
                transition={{
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: 2.3,
                  ease: 'easeInOut',
                  repeatDelay: 0.3,
                }}
              />

              <motion.span
                className="inline-block origin-center select-none"
                animate={{
                  scale: [1, 1.25, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }}
              >
                🚀
              </motion.span>
              <span className="relative z-10">For WordPress Developers</span>
            </div>

            {/* Main Headline (Always Strictly 2 Balanced Lines in Bangla & English) */}
            <h1 className="text-3xl sm:text-4xl lg:text-[45px] font-black text-slate-900 leading-[1.2] tracking-tight">
              <span className="block whitespace-nowrap">
                WordPress <span className="text-blue-600">Developer</span>
              </span>
              <span className="block text-blue-600 mt-1">
                Platform <span className="text-slate-900">Hub</span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
              Premium plugins, themes, templates, resources and documentation — all in one place.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="#plugins"
                className="py-3.5 px-7 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-600/40 flex items-center gap-2"
              >
                <span>View All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#pricing"
                className="py-3.5 px-7 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 transition shadow-xs"
              >
                View Pricing
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
                  <p className="text-[11px] font-medium text-slate-500 mt-1">Premium Members</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 leading-none">50K+</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">Total Downloads</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 leading-none">99.9%</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">Secure & Clean</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 leading-none">24/7</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">Support Service</p>
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
                className="w-full h-auto object-contain hover:scale-[1.02] transition-transform duration-300 mix-blend-multiply"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
