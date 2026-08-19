'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingCart,
  LogOut,
  Phone,
  Search,
  Gift,
  Home,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Layers,
  FileText,
  Bookmark,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSession, signOut } from '@/lib/auth-client';

export default function Header() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [cartCount, setCartCount] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [activeSubscription, setActiveSubscription] = useState(null);
  const [isMembershipLoading, setIsMembershipLoading] = useState(true);
  const [subTimeLeft, setSubTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isLifetime: false, isExpired: false });

  const megaMenuRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Close mobile menu & mega menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  }, [pathname]);

  // Handle outside click for Mega Menu & User Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setMegaMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load initial membership state from localStorage or user profile
  useEffect(() => {
    const loadMembership = () => {
      try {
        const storedMem = localStorage.getItem('user_membership');
        if (storedMem) {
          setActiveSubscription(JSON.parse(storedMem));
        }
        const storedProf = localStorage.getItem('user_profile');
        if (storedProf) {
          const parsedProf = JSON.parse(storedProf);
          if (parsedProf?.membership) {
            setActiveSubscription(parsedProf.membership);
          }
        }
      } catch (err) { }
    };

    loadMembership();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timer = null;

    const loadProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data?.user && isMounted) {
            setProfileData(data.user);
            localStorage.setItem('user_profile', JSON.stringify(data.user));
            if (data.user.membership && (data.user.membership.status === 'active' || !data.user.membership.status)) {
              setActiveSubscription(data.user.membership);
              localStorage.setItem('user_membership', JSON.stringify(data.user.membership));
            } else {
              setActiveSubscription(null);
              localStorage.removeItem('user_membership');
            }
          }
        } else if (res.status === 401 && isMounted) {
          setProfileData(null);
          setActiveSubscription(null);
          localStorage.removeItem('user_profile');
          localStorage.removeItem('user_membership');
        }
      } catch (err) {
      } finally {
        timer = setTimeout(() => {
          if (isMounted) setIsMembershipLoading(false);
        }, 800);
      }
    };

    if (session?.user) {
      loadProfile();
    } else if (!isSessionLoading) {
      setActiveSubscription(null);
      localStorage.removeItem('user_membership');
      timer = setTimeout(() => {
        if (isMounted) setIsMembershipLoading(false);
      }, 800);
    }

    const handleProfileUpdate = () => {
      const storedMem = localStorage.getItem('user_membership');
      if (storedMem) {
        try {
          const parsed = JSON.parse(storedMem);
          if (parsed && (parsed.status === 'active' || !parsed.status)) {
            setActiveSubscription(parsed);
            setIsMembershipLoading(false);
            return;
          }
        } catch (e) {}
      }
      setActiveSubscription(null);
      setIsMembershipLoading(false);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [session, isSessionLoading]);

  // Live Subscription Timer Countdown for Active Membership
  useEffect(() => {
    if (!activeSubscription || !activeSubscription.expiresAt) return;

    if (activeSubscription.expiresAt === 'LIFETIME' || activeSubscription.planId === 'premium') {
      setSubTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLifetime: true, isExpired: false });
      return;
    }

    const expiryMs = new Date(activeSubscription.expiresAt).getTime();

    const updateTimer = () => {
      const nowMs = Date.now();
      const diff = expiryMs - nowMs;

      if (isNaN(expiryMs) || diff <= 0) {
        setSubTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLifetime: false, isExpired: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setSubTimeLeft({ days, hours, minutes, seconds, isLifetime: false, isExpired: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeSubscription]);

  const userName = profileData?.name || session?.user?.name || 'User';
  const userImage = profileData?.image || session?.user?.image;
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('user_profile');
      localStorage.removeItem('user_membership');
      setActiveSubscription(null);
      setProfileData(null);
      window.dispatchEvent(new Event('profileUpdated'));
      if (signOut) {
        await signOut();
      }
      toast.success('Logout Successful!', { autoClose: 2000 });
      window.location.href = '/login';
    } catch (err) {
      localStorage.removeItem('user_profile');
      localStorage.removeItem('user_membership');
      setActiveSubscription(null);
      setProfileData(null);
      toast.success('Logout Successful!', { autoClose: 2000 });
      window.location.href = '/login';
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/resources?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/product-category/wordpress-themes', label: 'Themes' },
    { href: '/product-category/wordpress-plugins', label: 'Plugins' },
    { href: '/product-category/seo-tools', label: 'SEO Tools' },
    { href: '/templates', label: 'Templates' },
    { href: '/resources', label: 'Resources' },
    { href: '/changelog', label: 'Changelog' },
    { href: '/contact', label: 'Contact' },
  ];

  const checkIsActive = (href) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname === href || pathname.startsWith(href);
  };

  // Mega Menu Organized Categories (Matching Project Product Titles)
  const megaMenuColumns = [
    {
      title: 'WordPress Themes',
      items: [
        { label: 'WoodMart Theme', href: '/resources?search=WoodMart' },
        { label: 'Astra Pro Addon', href: '/resources?search=Astra' },
        { label: 'Martfury Theme', href: '/resources?search=Martfury' },
        { label: 'Flatsome Theme', href: '/resources?search=Flatsome' },
        { label: 'Multipurpose Themes', href: '/resources?search=Multipurpose' },
      ],
    },
    {
      title: 'WordPress Plugins',
      items: [
        { label: 'Elementor Pro', href: '/resources?search=Elementor' },
        { label: 'WP Rocket Premium', href: '/resources?search=WP Rocket' },
        { label: 'Rank Math SEO Pro', href: '/resources?search=Rank Math' },
        { label: 'Yoast SEO Premium', href: '/resources?search=Yoast' },
        { label: 'PixelYourSite Pro', href: '/resources?search=PixelYourSite' },
      ],
    },
    {
      title: 'WooCommerce Plugins',
      items: [
        { label: 'Cartflows pro', href: '/resources?search=Cartflows' },
        { label: 'AAWP Affiliate Plugin', href: '/resources?search=AAWP' },
        { label: 'JetAppointments Booking', href: '/resources?search=JetAppointments' },
        { label: 'WooCommerce Plugins', href: '/resources?search=WooCommerce' },
        { label: 'Form Builder Plugins', href: '/resources?search=Form' },
      ],
    },
    {
      title: 'WordPress Bundles & Packs',
      items: [
        { label: 'Professional WordPress Bundle', href: '/resources?search=Professional%20WordPress%20Bundle' },
        { label: 'Mega Plugin Bundle', href: '/resources?search=Bundle' },
        { label: 'E-Commerce Store Pack', href: '/resources?search=WooCommerce' },
        { label: 'SEO Super Pack', href: '/resources?search=SEO' },
        { label: 'All Premium Products', href: '/resources' },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm transition-all border-b border-slate-200/80">

      {/* TIER 1: Top Brand, Phone, Search & User Action Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4">

          {/* Brand Logo & Phone Number */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/icon.png"
                alt="Developers Club"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col" suppressHydrationWarning={true}>
                <span className="text-lg sm:text-xl font-black text-slate-900 leading-tight tracking-tight" suppressHydrationWarning={true}>
                  Developers <span className="text-indigo-600" suppressHydrationWarning={true}>Club</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-widest uppercase -mt-0.5" suppressHydrationWarning={true}>
                  BY BENGAL-IT
                </span>
              </div>
            </Link>

            {/* Desktop & Tablet Phone Number Display */}
            <a
              href="tel:01796679254"
              className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 border-l border-slate-200 pl-4 py-1 transition"
              title="Call Support: 01796-679254"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>01796-679254</span>
            </a>
          </div>

          {/* Desktop & Tablet Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex items-center w-full max-w-xs md:max-w-md bg-slate-50 border border-slate-200 rounded-full overflow-hidden focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/20 transition shadow-2xs"
          >
            <input
              type="text"
              placeholder="Search theme & plugin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-5 py-2 text-xs font-medium transition flex items-center justify-center shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Right Action Controls: Membership CTA, Cart, User Session & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Get Membership CTA Button OR Active Membership Live Countdown Display OR Professional Loading Spinner */}
            {isMembershipLoading || isSessionLoading ? (
              <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-medium text-slate-500">
                <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                <span className="text-[11px] font-bold text-slate-400">Checking status...</span>
              </div>
            ) : activeSubscription && (!subTimeLeft.isExpired || subTimeLeft.isLifetime) ? (
              <Link
                href="/membership"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-slate-800 shadow-2xs transition"
                title="Active Membership Status & Expiration Countdown"
              >
                <Clock className="w-3.5 h-3.5 text-red-500 shrink-0 animate-pulse" />
                <div className="flex items-center gap-1.5 text-xs font-bold whitespace-nowrap">
                  <span className="text-slate-800 font-extrabold uppercase tracking-wider text-[11px] truncate max-w-[85px]">
                    {(activeSubscription.planId || activeSubscription.planTitle || 'PRO').toUpperCase()}
                  </span>
                  <span className="text-slate-300 font-normal">•</span>
                  {subTimeLeft.isLifetime ? (
                    <span className="text-red-500 font-black text-xs">LIFETIME</span>
                  ) : (
                    <span className="text-red-500 font-bold font-mono text-xs tracking-tight">
                      {subTimeLeft.days}d {String(subTimeLeft.hours).padStart(2, '0')}h {String(subTimeLeft.minutes).padStart(2, '0')}m {String(subTimeLeft.seconds).padStart(2, '0')}s
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <Link
                href="/membership"
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition hover:scale-102 cursor-pointer"
              >
                <Gift className="w-4 h-4 text-indigo-200" />
                <span>Membership</span>
              </Link>
            )}

            {/* User Session Check: Ultra-Clean Profile Dropdown (No Clutter) */}
            {session?.user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-xl transition border border-slate-200 shadow-2xs cursor-pointer group"
                  title="User Profile Menu"
                >
                  {userImage ? (
                    <img src={userImage} alt={userName} className="w-8 h-8 rounded-lg object-cover border border-indigo-500 shadow-2xs shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center border border-indigo-400 shadow-2xs shrink-0">
                      {userInitial}
                    </div>
                  )}
                  <span suppressHydrationWarning className="hidden sm:inline text-xs font-medium truncate max-w-[90px]">
                    {userName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                </button>

                {/* Elegant User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                      <p className="text-xs font-black text-slate-900 truncate" suppressHydrationWarning>{userName}</p>
                      <p className="text-[11px] text-slate-400 font-medium truncate" suppressHydrationWarning>{session.user.email}</p>
                    </div>

                    <a
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition"
                    >
                      <Gift className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Dashboard</span>
                    </a>

                    <div className="border-t border-slate-100 my-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-600 font-medium text-xs rounded-xl transition border border-slate-200 shadow-2xs cursor-pointer"
                title="Login to Account"
              >
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Login</span>
              </a>
            )}

            {/* Cart Drawer Button */}
            <button
              className="relative p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle Button (Matching 2nd Image Icon) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-800 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-6 h-6 stroke-[2.5]" />
            </button>

          </div>

        </div>
      </div>

      {/* TIER 2: Bottom Navigation Bar Row (Project Indigo Theme Background with Mega Menu Dropdown) */}
      <div className="hidden lg:block bg-indigo-600 text-white border-t border-indigo-500/50 relative" ref={megaMenuRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-start gap-1 sm:gap-2 py-1.5 text-xs font-medium tracking-wide">

            {/* Home Link */}
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${checkIsActive('/')
                ? 'bg-white/20 text-white font-bold shadow-xs ring-1 ring-white/30'
                : 'text-white hover:bg-white/10 font-medium'
                }`}
            >
              <Home className="w-3.5 h-3.5 shrink-0" />
              <span>Home</span>
            </Link>

            {/* MEGA MENU TRIGGER BUTTON (Matching Reference Image 1 "Theme & Plugins ▾") */}
            <div className="relative">
              <button
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                onMouseEnter={() => setMegaMenuOpen(true)}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${megaMenuOpen
                  ? 'bg-white text-indigo-700 font-bold shadow-md'
                  : 'text-white hover:bg-white/10 font-medium'
                  }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Theme & Plugins</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180 text-indigo-700' : ''}`} />
              </button>

              {/* MEGA MENU DROPDOWN BOX (Matching Reference Image 1 Layout) */}
              {megaMenuOpen && (
                <div
                  onMouseLeave={() => setMegaMenuOpen(false)}
                  className="absolute top-full left-0 mt-1 w-[920px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-7 text-slate-800 grid grid-cols-4 gap-6 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-200"
                >
                  {megaMenuColumns.map((col, idx) => (
                    <div key={idx} className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                        {col.title}
                      </h4>
                      <ul className="space-y-2 text-xs">
                        {col.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <Link
                              href={item.href}
                              onClick={() => setMegaMenuOpen(false)}
                              className="group/item flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-normal transition-colors py-0.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 group-hover/item:scale-110 transition-transform" />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rest of Navigation Links (Positioned with space after Theme & Plugins) */}
            <div className="flex items-center gap-1.5 md:gap-3 lg:gap-5 ml-auto">
              {navItems.slice(1).map((item) => {
                const isActive = checkIsActive(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${isActive
                      ? 'bg-white/20 text-white font-bold shadow-xs ring-1 ring-white/30'
                      : 'text-white hover:bg-white/10 font-medium'
                      }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* MOBILE DRAWER SIDEBAR (Matching Reference Image 2 Design) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Dark Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
          />

          {/* Left Slide-Over Drawer Panel (Matching Image 2 Layout & Style) */}
          <div className="relative w-72 sm:w-80 max-w-full bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-50 overflow-y-auto animate-in slide-in-from-left duration-300">

            <div className="space-y-6">
              {/* Drawer Top Header: Search & Close Button */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/icon.png" alt="" className="w-7 h-7 object-contain" />
                    <span className="text-base font-black text-slate-900 tracking-tight">
                      Developers <span className="text-indigo-600">Club</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X className="w-6 h-6 stroke-[2.5]" />
                  </button>
                </div>

                {/* Mobile Drawer Search Bar (Matching Image 2 Input + Search Icon Button) */}
                <form onSubmit={handleSearchSubmit} className="flex items-center w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search theme & plugin..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium bg-transparent"
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 shrink-0 cursor-pointer">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Vertical Menu Items (Matching Image 2 Text Items) */}
              <nav className="space-y-1 text-sm font-medium border-t border-slate-100 pt-4">
                {navItems.map((item) => {
                  const isActive = checkIsActive(item.href);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2.5 px-3 rounded-xl transition ${isActive
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                        }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Icon Action Items (Matching Image 2 Bottom Layout: Changelog & Cart) */}
            <div className="pt-6 border-t border-slate-100 space-y-3 text-xs font-bold text-slate-700">
              <Link
                href="/changelog"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2 px-3 hover:bg-slate-50 rounded-xl transition"
              >
                <FileText className="w-4 h-4 text-slate-800 shrink-0" />
                <span>Changelog</span>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 py-2 px-3 hover:bg-slate-50 rounded-xl transition text-left cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-slate-800 shrink-0" />
                <span>Cart</span>
              </button>

              <a
                href="tel:01796679254"
                className="flex items-center gap-3 py-2.5 px-3 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 transition font-extrabold"
              >
                <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Call: 01796-679254</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
