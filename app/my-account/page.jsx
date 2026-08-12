'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import Link from 'next/link';
import { User, Download, ShieldCheck, Calendar, LogOut, ArrowLeft, Zap, Sparkles, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'react-toastify';

export default function MyAccountPage() {
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user && typeof window !== 'undefined') {
      if (sessionStorage.getItem('just_logged_in')) {
        toast.success('সফলভাবে লগইন হয়েছে!');
        sessionStorage.removeItem('just_logged_in');
      } else if (sessionStorage.getItem('just_registered')) {
        toast.success('সফলভাবে রেজিস্ট্রেশন হয়েছে!');
        sessionStorage.removeItem('just_registered');
      }
    }
  }, [session]);

  if (!mounted || isPending) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between" suppressHydrationWarning>
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-blue-600 font-bold text-sm">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>অ্যাকাউন্ট ডাটা লোড হচ্ছে...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between" suppressHydrationWarning>
        <Header />
        <main className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-xl">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">লগইন প্রয়োজন</h1>
          <p className="text-sm text-slate-600 mb-6">
            ড্যাশবোর্ড দেখতে এবং ডাউনলোড ম্যানেজ করতে অনুগ্রহ করে লগইন করুন।
          </p>
          <Link
            href="/"
            className="py-3 px-6 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোমে ফিরে যান</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const user = session.user;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0256E8&color=fff`;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.info('লগআউট করা হয়েছে');
    } catch (err) {
      toast.error('লগআউট করতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" suppressHydrationWarning>
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        
        {/* User Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user.image || fallbackAvatar}
              alt={user.name || 'User Avatar'}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = fallbackAvatar;
              }}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-md bg-blue-800"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{user.name || 'স্বাগতম মেম্বার!'}</h1>
                <span className="px-2.5 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-black rounded-md uppercase tracking-wider">
                  VIP Active
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট</span>
          </button>
        </div>

        {/* Dashboard Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Card 1: Active Subscription Plan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">মেম্বারশিপ প্ল্যান</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">বার্ষিক VIP প্ল্যান</h3>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              মেয়াদ শেষ: ৩১ মে, ২০২৫
            </p>
          </div>

          {/* Card 2: Daily Download Limit Counter */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">আজকের ডাউনলোড লিমিট</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-black text-slate-900">১৫ / ৫০</span>
              <span className="text-xs text-slate-500 font-medium">ফাইল ব্যবহার হয়েছে</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-[30%]" />
            </div>
          </div>

          {/* Card 3: Total Account Downloads */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">মোট ডাউনলোড</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-1">১২৮ টি</h3>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              সকল ফাইল আনলিমিটেড ভ্যালিড
            </p>
          </div>

        </div>

        {/* Download History Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">সাম্প্রতিক ডাউনলোড হিস্ট্রি</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 font-bold text-slate-900">Elementor Pro v3.20.1</td>
                  <td className="p-4"><span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-semibold">Plugin</span></td>
                  <td className="p-4">১০ আগস্ট, ২০২৪</td>
                  <td className="p-4 text-right">
                    <button className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">
                      পুনরায় ডাউনলোড
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">WP Rocket v3.15.9</td>
                  <td className="p-4"><span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-semibold">Plugin</span></td>
                  <td className="p-4">০৮ আগস্ট, ২০২৪</td>
                  <td className="p-4 text-right">
                    <button className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">
                      পুনরায় ডাউনলোড
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Astra Pro Theme v4.6.2</td>
                  <td className="p-4"><span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded font-semibold">Theme</span></td>
                  <td className="p-4">০৫ আগস্ট, ২০২৪</td>
                  <td className="p-4 text-right">
                    <button className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">
                      পুনরায় ডাউনলোড
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
