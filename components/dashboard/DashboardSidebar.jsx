'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  FolderHeart,
  PlusCircle,
  Layers,
  Ticket,
  Users,
  Globe,
  Home,
  LogOut,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  Sparkles,
  Award,
  Bell,
  FolderTree,
  Tag,
  Sliders,
  Star,
  Box,
  Settings
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import { toast } from 'react-toastify';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
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

    loadProfile();

    const handleProfileUpdate = () => {
      const stored = localStorage.getItem('user_profile');
      if (stored) {
        setProfileData(JSON.parse(stored));
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  // Determine active role strictly from session role or active path fallback
  const sessionRole = profileData?.role || session?.user?.role;
  const isAdminPath = pathname.startsWith('/dashboard/admin');
  const isGuestPath = pathname.startsWith('/dashboard/guest');

  let activeRole = 'user';
  if (sessionRole) {
    activeRole = sessionRole;
  } else if (isAdminPath) {
    activeRole = 'admin';
  } else if (isGuestPath) {
    activeRole = 'guest';
  }

  const isProductsPath =
    pathname.startsWith('/dashboard/admin/all-products') ||
    pathname.startsWith('/dashboard/admin/add-product') ||
    pathname.startsWith('/dashboard/admin/brands') ||
    pathname.startsWith('/dashboard/admin/categories') ||
    pathname.startsWith('/dashboard/admin/tags') ||
    pathname.startsWith('/dashboard/admin/attributes') ||
    pathname.startsWith('/dashboard/admin/reviews');

  const isSettingsPath =
    pathname.startsWith('/dashboard/admin/my-profile') ||
    pathname.startsWith('/dashboard/admin/my-collections') ||
    pathname.startsWith('/dashboard/admin/get-cupon') ||
    pathname.startsWith('/dashboard/admin/all-users') ||
    pathname.startsWith('/dashboard/admin/public-collections');

  const [productsOpen, setProductsOpen] = useState(isProductsPath);
  const [settingsOpen, setSettingsOpen] = useState(isSettingsPath);

  useEffect(() => {
    if (isProductsPath) setProductsOpen(true);
    if (isSettingsPath) setSettingsOpen(true);
  }, [pathname]);

  // Admin Links
  const adminNavItems = [
    {
      title: 'Dashboard Overview',
      href: '/dashboard/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'All Notifications',
      href: '/dashboard/admin/all-notifications',
      icon: Bell,
    },
    {
      id: 'products',
      title: 'Products',
      icon: Box,
      isDropdown: true,
      children: [
        { title: 'All Products', href: '/dashboard/admin/all-products', icon: Layers },
        { title: 'Add new product', href: '/dashboard/admin/add-product', icon: PlusCircle },
        { title: 'Brands', href: '/dashboard/admin/brands', icon: Award },
        { title: 'Categories', href: '/dashboard/admin/categories', icon: FolderTree },
        { title: 'Tags', href: '/dashboard/admin/tags', icon: Tag },
        { title: 'Attributes', href: '/dashboard/admin/attributes', icon: Sliders },
        { title: 'Reviews', href: '/dashboard/admin/reviews', icon: Star },
      ],
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      isDropdown: true,
      children: [
        { title: 'My Profile', href: '/dashboard/admin/my-profile', icon: User },
        { title: 'My Collection', href: '/dashboard/admin/my-collections', icon: FolderHeart },
        { title: 'Guest Coupon', href: '/dashboard/admin/get-cupon', icon: Ticket },
        { title: 'All Users', href: '/dashboard/admin/all-users', icon: Users },
        { title: 'Public Collection', href: '/dashboard/admin/public-collections', icon: Globe },
      ],
    },
  ];

  // User Links
  const userNavItems = [
    {
      title: 'Dashboard Overview',
      href: '/dashboard/user',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'All Notifications',
      href: '/dashboard/user/all-notifications',
      icon: Bell,
    },
    {
      title: 'My Profile',
      href: '/dashboard/user/my-profile',
      icon: User,
    },
    {
      title: 'My Collection',
      href: '/dashboard/user/my-collections',
      icon: FolderHeart,
    },
  ];

  // Guest Links
  const guestNavItems = [
    {
      title: 'Guest Dashboard',
      href: '/dashboard/guest',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'All Notifications',
      href: '/dashboard/guest/all-notifications',
      icon: Bell,
    },
    {
      title: 'My Profile',
      href: '/dashboard/guest/my-profile',
      icon: User,
    },
    {
      title: 'My Collection',
      href: '/dashboard/guest/my-collections',
      icon: FolderHeart,
    },
  ];

  let currentNavItems = userNavItems;
  if (activeRole === 'admin') currentNavItems = adminNavItems;
  if (activeRole === 'guest') currentNavItems = guestNavItems;

  const handleLogout = async () => {
    try {
      localStorage.removeItem('user_profile');
      if (signOut) {
        await signOut();
      }
      toast.success('Logout Successful!', { autoClose: 2000 });
      setTimeout(() => {
        window.location.href = '/login';
      }, 400);
    } catch (err) {
      toast.success('Logout Successful!', { autoClose: 2000 });
      window.location.href = '/login';
    }
  };

  const isLinkActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const userName = profileData?.name || session?.user?.name || 'Developers Club User';
  const userEmail = profileData?.email || session?.user?.email || 'user@developersclub.com';
  const userImage = profileData?.image || session?.user?.image;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 bg-white text-slate-800 rounded-xl border border-slate-200 shadow-md flex items-center gap-2 hover:bg-slate-50 transition cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span suppressHydrationWarning className="text-xs font-bold">Menu</span>
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky lg:top-0 h-screen z-50 w-72 bg-white border-r border-slate-200 text-slate-800 flex flex-col justify-between shadow-2xs transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Top Section Wrapper */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Brand Logo Header */}
          <div className="p-5 border-b border-slate-100 shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img src="/icon.png" alt="Developers Club" className="w-9 h-9 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1">
                  Developers <span className="text-blue-600">Club</span>
                </span>
                <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                  {activeRole === 'admin'
                    ? 'ADMIN DASHBOARD'
                    : activeRole === 'guest'
                      ? 'GUEST DASHBOARD'
                      : 'USER DASHBOARD'}
                </span>
              </div>
            </Link>

            {/* User Profile Card (Top of Sidebar) */}
            <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200/80 flex items-center gap-3 shadow-2xs">
              <div className="relative shrink-0">
                {userImage ? (
                  <img
                    src={userImage}
                    alt={userName}
                    className={`w-10 h-10 rounded-xl object-cover border-2 shadow-xs ${
                      activeRole === 'admin'
                        ? 'border-purple-500'
                        : activeRole === 'guest'
                          ? 'border-amber-500'
                          : 'border-blue-500'
                    }`}
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-xl text-white font-black text-sm flex items-center justify-center border-2 shadow-xs ${
                      activeRole === 'admin'
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 border-purple-500'
                        : activeRole === 'guest'
                          ? 'bg-gradient-to-tr from-amber-500 to-amber-600 border-amber-500'
                          : 'bg-gradient-to-tr from-blue-600 to-indigo-600 border-blue-400'
                    }`}
                  >
                    {userInitial}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-2xs" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-900 truncate">{userName}</span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 truncate">{userEmail}</span>
                <span
                  className={`mt-1 inline-self-start px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border w-max ${activeRole === 'admin'
                    ? 'bg-purple-100 text-purple-700 border-purple-200'
                    : activeRole === 'guest'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}
                >
                  {activeRole ? activeRole.toUpperCase() : 'USER'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto flex-1 min-h-0">
            <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              {activeRole === 'admin'
                ? 'Admin Navigation'
                : activeRole === 'guest'
                  ? 'Guest Navigation'
                  : 'User Navigation'}
            </div>

            {currentNavItems.map((item, idx) => {
              const Icon = item.icon;

              if (item.isDropdown) {
                const isProducts = item.id === 'products';
                const isAnyChildActive = isProducts ? isProductsPath : isSettingsPath;
                const isOpen = isProducts ? productsOpen : settingsOpen;

                const setOpenState = (val) => {
                  if (isProducts) setProductsOpen(val);
                  else setSettingsOpen(val);
                };

                return (
                  <div
                    key={item.id || item.title || idx}
                    className="space-y-1"
                  >
                    {/* Main Category Header Button */}
                    <button
                      type="button"
                      onClick={() => setOpenState(!isOpen)}
                      className={`w-full group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isAnyChildActive
                          ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                          : isOpen
                            ? 'bg-blue-50/90 text-blue-700 border border-blue-200/80 shadow-2xs font-extrabold'
                            : 'text-slate-700 hover:bg-slate-100/70 hover:text-blue-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isAnyChildActive
                              ? 'bg-white/20 text-white shadow-2xs'
                              : isOpen
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="tracking-wide">{item.title}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md ${
                            isAnyChildActive
                              ? 'bg-white/20 text-white'
                              : isOpen
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                          }`}
                        >
                          {item.children.length}
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform duration-300 ${
                            isOpen
                              ? 'rotate-90 ' + (isAnyChildActive ? 'text-white' : 'text-blue-600')
                              : isAnyChildActive
                                ? 'text-white'
                                : 'text-slate-400 group-hover:text-blue-600'
                          }`}
                        />
                      </div>
                    </button>

                    {/* Sleek Inline Bottom Dropdown Card with Dark Background */}
                    {isOpen && (
                      <div className="ml-2 mr-1 p-2 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800/90 shadow-md space-y-1 my-1.5 transition-all duration-200 ease-in-out">
                        {item.children.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = subItem.href !== '#' && pathname === subItem.href;

                          if (subItem.isPlaceholder) {
                            return (
                              <div
                                key={subItem.title}
                                className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-300 rounded-xl transition-colors cursor-default"
                                title="Coming Soon"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {SubIcon && <SubIcon className="w-3.5 h-3.5 shrink-0 text-slate-500" />}
                                  <span className="truncate text-[11px]">{subItem.title}</span>
                                </div>
                                <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                                  SOON
                                </span>
                              </div>
                            );
                          }

                          return (
                            <Link
                              key={subItem.title}
                              href={subItem.href}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all duration-150 ${
                                isSubActive
                                  ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/90 font-bold'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {SubIcon && (
                                  <SubIcon
                                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                                      isSubActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                                    }`}
                                  />
                                )}
                                <span className="truncate">{subItem.title}</span>
                              </div>

                              {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs shrink-0" />}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const active = isLinkActive(item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group relative flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    active
                      ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        active
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="tracking-wide">{item.title}</span>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      active ? 'text-blue-600 translate-x-0.5' : 'text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions Section (Home & Logout) Pushed to Bottom */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-2 shrink-0">
          {/* Home Button */}
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 shadow-xs transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>Go to Home</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Logout</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-extrabold">Exit</span>
          </button>
        </div>
      </aside>
    </>
  );
}
