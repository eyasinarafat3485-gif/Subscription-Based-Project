'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = "404 Page Not Found | Developers Club - Bangladesh's WordPress Developer Platform";
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-20 px-4 relative overflow-hidden">
        {/* Abstract Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-xl mx-auto flex flex-col items-center">
          
          {/* Main 404 Container with Badge */}
          <div className="relative mb-6 select-none">
            {/* "Lost in Space" tilted badge */}
            <div className="absolute -top-3 -right-6 md:-right-8 bg-blue-600 text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg transform rotate-12 animate-bounce duration-1000">
              Lost in Space
            </div>
            
            {/* Big Gradient 404 */}
            <h1 className="text-[120px] md:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-r from-blue-600 via-indigo-500 to-pink-500 text-transparent bg-clip-text select-none drop-shadow-sm">
              404
            </h1>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Page Not Found
          </h2>

          {/* Subtitle / Description */}
          <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-10 px-2">
            Sorry! The page or product you are looking for has probably been moved, deleted, or is temporarily unavailable. Please click one of the buttons below to return to the website.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link
              href="/"
              className="w-full sm:w-auto py-3.5 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home Page</span>
            </Link>

            <Link
              href="/#plugins"
              className="w-full sm:w-auto py-3.5 px-8 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-sm rounded-2xl border border-slate-200 shadow-sm transition flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-blue-600" />
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
