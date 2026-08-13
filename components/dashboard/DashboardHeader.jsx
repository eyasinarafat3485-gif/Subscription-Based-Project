'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { ShieldCheck, UserCheck, Award, Bell, Search } from 'lucide-react';
import Link from 'next/link';

export default function DashboardHeader() {
  const { data: session } = useSession();
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
      } catch (err) {}
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

  const userRole = profileData?.role || session?.user?.role || 'user';
  const userName = profileData?.name || session?.user?.name || 'Developers Club User';
  const userEmail = profileData?.email || session?.user?.email || 'user@developersclub.com';
  const userImage = profileData?.image || session?.user?.image;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
      {/* Left: Greeting & Search Bar */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <span>স্বাগতম, {userName.split(' ')[0]}</span>
            <span className="text-base">👋</span>
          </h2>
          <p className="text-[11px] font-medium text-slate-500">
            {userRole === 'admin'
              ? 'Developers Club সিস্টেম এডমিন প্যানেল'
              : userRole === 'guest'
              ? 'গেস্ট ফ্রী ট্রায়াল মেম্বারশিপ'
              : 'প্রো মেম্বারশিপ ড্যাশবোর্ড'}
          </p>
        </div>

        {/* Global Search Bar Input */}
        <div className="relative hidden lg:block w-72">
          <input
            type="text"
            placeholder="প্লাগইন, থিম বা ফাইল অনুসন্ধান..."
            className="w-full bg-slate-100/80 border border-slate-200/80 rounded-xl px-3.5 py-1.5 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition shadow-xs font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
        </div>
      </div>

      {/* Right: Role Badge & Professional User Profile Card */}
      <div className="flex items-center gap-3.5 ml-auto">
        {/* Role Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80">
          {userRole === 'admin' ? (
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          ) : userRole === 'guest' ? (
            <Award className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          )}
          <span
            className={`text-[10px] font-black uppercase tracking-wider ${
              userRole === 'admin'
                ? 'text-purple-700'
                : userRole === 'guest'
                ? 'text-amber-700'
                : 'text-blue-700'
            }`}
          >
            {userRole === 'admin' ? 'ADMIN' : userRole === 'guest' ? 'GUEST PASS' : 'PRO MEMBER'}
          </span>
        </div>

        {/* Notifications Icon Button */}
        <button
          className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          title="নোটিফিকেশন"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Professional User Profile Card & Avatar */}
        <Link
          href={
            userRole === 'admin'
              ? '/dashboard/admin/my-profile'
              : userRole === 'guest'
              ? '/dashboard/guest/my-profile'
              : '/dashboard/user/my-profile'
          }
          className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all group"
        >
          {/* Avatar Container with Online Indicator Dot */}
          <div className="relative shrink-0">
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="w-9 h-9 rounded-xl object-cover border-2 border-blue-500 shadow-xs group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center border-2 border-blue-400 shadow-xs group-hover:scale-105 transition-transform">
                {userInitial}
              </div>
            )}
            {/* Online Green Pulse Indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-2xs" />
          </div>

          {/* User Name & Email */}
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[140px]">
              {userName}
            </span>
            <span className="text-[10px] font-medium text-slate-400 truncate max-w-[140px]">
              {userEmail}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
