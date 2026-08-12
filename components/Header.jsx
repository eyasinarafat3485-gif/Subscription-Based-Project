'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Code, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';

export default function Header() {
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <a href="/" className="flex items-center gap-2.5 group">
              <img
                src="/icon.png"
                alt="Developers Club"
                className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col" suppressHydrationWarning={true}>
                <span className="text-xl font-black text-slate-900 leading-tight tracking-tight" suppressHydrationWarning={true}>
                  Developers <span className="text-blue-600" suppressHydrationWarning={true}>Club</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase -mt-0.5" suppressHydrationWarning={true}>
                  BY BENGAL-IT
                </span>
              </div>
            </a>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700">
              <a href="/" className="hover:text-blue-600 transition-colors">
                হোম
              </a>
              <a href="/#plugins" className="hover:text-blue-600 transition-colors">
                প্লাগইন
              </a>
              <a href="/#themes" className="hover:text-blue-600 transition-colors">
                থিম
              </a>
              <a href="/#templates" className="hover:text-blue-600 transition-colors">
                টেমপ্লেট
              </a>
              <a href="/#resources" className="hover:text-blue-600 transition-colors">
                রিসোর্স
              </a>
              <a href="/#docs" className="hover:text-blue-600 transition-colors">
                ডকুমেন্টেশন
              </a>
              <a href="/#pricing" className="hover:text-blue-600 transition-colors">
                প্রাইসিং
              </a>
              <a href="/contact" className="hover:text-blue-600 transition-colors">
                যোগাযোগ
              </a>
            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center gap-4">
              {/* Cart Drawer Trigger Button */}
              <button
                className="relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition"
                title="কার্ট"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Session Check */}
              {session?.user ? (
                <div className="flex items-center gap-3">
                  <a
                    href="/my-account"
                    className="flex items-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    <span>মাই অ্যাকাউন্ট</span>
                  </a>
                  <button
                    onClick={() => signOut()}
                    className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    title="লগআউট"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <a
                    href="/login"
                    className="text-slate-700 hover:text-blue-600 px-3 py-2 transition"
                  >
                    লগইন
                  </a>
                  <a
                    href="/register"
                    className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all hover:shadow-blue-500/35"
                  >
                    সাইন আপ
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
