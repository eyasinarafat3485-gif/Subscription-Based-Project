'use client';

import { useState, useEffect } from 'react';
import { signIn, signUp } from '@/lib/auth-client';
import { Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = "Register | Developers Club - বাংলাদেশের WordPress Developer Platform";
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('just_logged_in', 'true');
      }
      await signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch (err) {
      const msg = err.message || 'Google Sign-In ব্যর্থ হয়েছে';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (role === 'guest') {
        const verifyRes = await fetch('/api/coupons/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coupon: coupon.trim(), email: email.trim() }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || verifyData.error) {
          const msg = verifyData.error || 'কুপন কোড ভেরিফিকেশন ব্যর্থ হয়েছে!';
          setError(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }
      }

      const res = await signUp.email({
        email,
        password,
        name,
        role,
      });

      if (res?.error) {
        const msg = res.error.message || 'সাইনআপ করতে ব্যর্থ হয়েছে';
        setError(msg);
        toast.error(msg);
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('just_registered', 'true');
        }
        window.location.href = '/dashboard';
      }
    } catch (err) {
      const msg = err.message || 'একটি সমস্যা দেখা দিয়েছে';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-20 px-4 relative overflow-hidden">
        {/* Abstract Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100/85">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-8 text-white text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-3 backdrop-blur-md">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
            <p className="text-xs text-blue-100 mt-1.5">
              বাংলাদেশের বিশ্বস্ত WordPress ডেভেলপার প্ল্যাটফর্ম
            </p>
          </div>

          {/* Card Body */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs rounded-xl border border-red-150">
                {error}
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition shadow-sm mb-6 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google দিয়ে সাইন আপ করুন</span>
            </button>

            <div className="relative my-5 text-center">
              <hr className="border-slate-200" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3.5 text-xs text-slate-400 select-none">
                অথবা ইমেইল দিয়ে
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">আপনার নাম</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: মোঃ সাকিব হোসেন"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              {/* Account Role Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">অ্যাকাউন্ট টাইপ (Role)</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      setError('');
                    }}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 appearance-none cursor-pointer"
                  >
                    <option value="user">User (ইউজার)</option>
                    <option value="guest">Guest (গেস্ট)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Coupon Code Input for Guest */}
              {role === 'guest' && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">কুপন কোড (Coupon Code)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="যেমন: VIP2026"
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 pl-1.5">
                    * গেস্ট অ্যাকাউন্টের জন্য অবশ্যই সঠিক কুপন কোড প্রদান করুন।
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">ইমেইল এড্রেস</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">পাসওয়ার্ড</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'প্রসেসিং হচ্ছে...' : 'সাইন আপ করুন'}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-slate-600">
              <p>
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <a href="/login" className="text-blue-600 font-bold hover:underline">
                  লগইন করুন
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
