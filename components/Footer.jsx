'use client';

import Link from 'next/link';
import { Code, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050D1E] text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 5 Columns Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Column 1: Brand & Socials */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/icon.png"
                alt="Developers Club"
                className="w-9 h-9 object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-lg font-black text-white leading-tight">
                  Developers <span className="text-blue-500">Club</span>
                </span>
                <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">
                  BY BENGAL-IT
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed">
              বাংলাদেশের সেরা প্রিমিয়াম WordPress প্লাগইন, থিম এবং ডেভেলপমেন্ট রিসোর্স হাব।
            </p>

            <div className="flex items-center gap-3 pt-2">
              {/* Facebook SVG */}
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* YouTube SVG */}
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* Telegram SVG */}
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition">
                <Send className="w-4 h-4" />
              </a>
              {/* Instagram SVG */}
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: প্রোডাক্ট */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">প্রোডাক্ট</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/#plugins" className="hover:text-blue-400 transition">প্লাগইন</Link></li>
              <li><Link href="/#themes" className="hover:text-blue-400 transition">থিম</Link></li>
              <li><Link href="/#templates" className="hover:text-blue-400 transition">টেমপ্লেট</Link></li>
              <li><Link href="/#resources" className="hover:text-blue-400 transition">রিসোর্স</Link></li>
              <li><Link href="/#tools" className="hover:text-blue-400 transition">টুলস</Link></li>
            </ul>
          </div>

          {/* Column 3: সাপোর্ট */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">সাপোর্ট</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/#docs" className="hover:text-blue-400 transition">ডকুমেন্টেশন</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition">যোগাযোগ ও সাপোর্ট</Link></li>
              <li><Link href="#articles" className="hover:text-blue-400 transition">ব্লগ</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">প্রাইভেসি পলিসি</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">রিফান্ড পলিসি</Link></li>
            </ul>
          </div>

          {/* Column 4: আমাদের সম্পর্কে */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">আমাদের সম্পর্কে</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="#" className="hover:text-blue-400 transition">আমাদের টিম</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">ফেসবুক গ্রুপ</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">প্রিমিয়াম সাপোর্ট</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">কুপন এন্ড ডিসকাউন্ট</Link></li>
            </ul>
          </div>

          {/* Column 5: নিউজলেটার */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">নিউজলেটার</h4>
            <p className="text-xs text-slate-400">নতুন আপডেট এবং অফারের তথ্য পেতে সাবস্ক্রাইব করুন।</p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="আপনার ইমেইল এড্রেস..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                সাবস্ক্রাইব করুন
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2024 Developers Club by Bengal-IT. All rights reserved.</p>

          {/* Payment Partner Logos */}
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] font-bold text-pink-500">
              bKash
            </span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] font-bold text-orange-500">
              Nagad
            </span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] font-bold text-blue-400">
              VISA
            </span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] font-bold text-red-500">
              MasterCard
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
