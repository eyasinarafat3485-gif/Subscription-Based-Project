'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, LogOut } from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';

export default function Header() {
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = localStorage.getItem('user_profile');
        if (stored) {
          setProfileData(JSON.parse(stored));
        }
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setProfileData(data.user);
            localStorage.setItem('user_profile', JSON.stringify(data.user));
          }
        }
      } catch (err) { }
    };

    if (session?.user) {
      loadProfile();
    }

    const handleProfileUpdate = () => {
      const stored = localStorage.getItem('user_profile');
      if (stored) {
        setProfileData(JSON.parse(stored));
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [session]);

  const userName = profileData?.name || session?.user?.name || 'User';
  const userImage = profileData?.image || session?.user?.image;
  const userInitial = userName.charAt(0).toUpperCase();

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
                Home
              </a>
              <a href="/#plugins" className="hover:text-blue-600 transition-colors">
                Plugins
              </a>
              <a href="/#themes" className="hover:text-blue-600 transition-colors">
                Themes
              </a>
              <a href="/#templates" className="hover:text-blue-600 transition-colors">
                Templates
              </a>
              <a href="/#resources" className="hover:text-blue-600 transition-colors">
                Resources
              </a>
              <a href="/#docs" className="hover:text-blue-600 transition-colors">
                Documentation
              </a>
              <a href="/#pricing" className="hover:text-blue-600 transition-colors">
                Pricing
              </a>
              <a href="/contact" className="hover:text-blue-600 transition-colors">
                Contact
              </a>
            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center gap-4">
              {/* Cart Drawer Trigger Button */}
              <button
                className="relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                title="Cart"
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
                    href="/dashboard"
                    className="flex items-center gap-2 py-1.5 px-3 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-bold text-slate-800 transition border border-slate-200/60 shadow-2xs group"
                  >
                    {userImage ? (
                      <img
                        src={userImage}
                        alt={userName}
                        className="w-6 h-6 rounded-full object-cover border border-blue-500 shadow-2xs group-hover:scale-105 transition-transform shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-[10px] flex items-center justify-center border border-blue-400 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                        {userInitial}
                      </div>
                    )}
                    <span suppressHydrationWarning>Dashboard</span>
                  </a>
                  <button
                    onClick={() => signOut()}
                    className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                    title="Logout"
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
                    Login
                  </a>
                  <a
                    href="/register"
                    className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all hover:shadow-blue-500/35"
                  >
                    Sign Up
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
