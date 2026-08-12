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
            <a href="/" className="flex items-center gap-2.5 group">
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
            </a>

            <p className="text-xs text-slate-400 leading-relaxed">
              বাংলাদেশের সেরা প্রিমিয়াম WordPress প্লাগইন, থিম এবং ডেভেলপমেন্ট রিসোর্স হাব।
            </p>

            <div className="flex items-center gap-3 pt-2">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/bengalitbd"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/8801793679254"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#25D366] text-slate-300 hover:text-white flex items-center justify-center transition"
                title="WhatsApp"
              >
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.42 13.43c-.22-.11-1.3-.64-1.5-.71-.2-.07-.35-.11-.5.11-.15.22-.58.73-.71.86-.13.13-.26.15-.48.04a6.11 6.11 0 0 1-1.79-1.1c-.43-.38-.72-.85-.81-1.07-.09-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.06-.11-.5-1.2-.68-1.65-.18-.43-.37-.37-.5-.37h-.43c-.15 0-.39.06-.59.28-.2.22-.77.75-.77 1.83 0 1.08.79 2.12.9 2.27.11.15 1.55 2.37 3.76 3.32.53.23.94.36 1.26.47.53.17 1.02.14 1.4.09.43-.06 1.3-.53 1.49-1.05.19-.52.19-.97.13-1.07-.06-.1-.22-.15-.44-.26z" strokeWidth="1.8" />
                </svg>
              </a>

              {/* Email */}
              <a
                href="mailto:info@bengal-it.com"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#EA4335] text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Email"
              >
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                  <rect width="20" height="16" x="2" y="4" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              {/* Send Contact */}
              <a
                href="/contact"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Contact Support"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: প্রোডাক্ট */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">প্রোডাক্ট</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/#plugins" className="hover:text-blue-400 transition">প্লাগইন</a></li>
              <li><a href="/#themes" className="hover:text-blue-400 transition">থিম</a></li>
              <li><a href="/#templates" className="hover:text-blue-400 transition">টেমপ্লেট</a></li>
              <li><a href="/#resources" className="hover:text-blue-400 transition">রিসোর্স</a></li>
              <li><a href="/#tools" className="hover:text-blue-400 transition">টুলস</a></li>
            </ul>
          </div>

          {/* Column 3: সাপোর্ট */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">সাপোর্ট</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/#docs" className="hover:text-blue-400 transition">ডকুমেন্টেশন</a></li>
              <li><a href="/contact" className="hover:text-blue-400 transition">যোগাযোগ ও সাপোর্ট</a></li>
              <li><a href="#articles" className="hover:text-blue-400 transition">ব্লগ</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">প্রাইভেসি পলিসি</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">রিফান্ড পলিসি</a></li>
            </ul>
          </div>

          {/* Column 4: আমাদের সম্পর্কে */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">আমাদের সম্পর্কে</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-blue-400 transition">আমাদের টিম</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">ফেসবুক গ্রুপ</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">প্রিমিয়াম সাপোর্ট</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">কুপন এন্ড ডিসকাউন্ট</a></li>
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
