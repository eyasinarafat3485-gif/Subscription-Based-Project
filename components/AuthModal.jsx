'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/lib/auth-client';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
      if (mode === 'login') {
        const res = await signIn.email({
          email,
          password,
        });
        if (res?.error) {
          const msg = res.error.message || 'লগইন করতে ব্যর্থ হয়েছে';
          setError(msg);
          toast.error(msg);
        } else {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('just_logged_in', 'true');
          }
          onClose();
          window.location.href = '/dashboard';
        }
      } else {
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
          onClose();
          window.location.href = '/dashboard';
        }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-3 backdrop-blur-md">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold">
            {mode === 'login' ? 'Developers Club-এ লগইন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            বাংলাদেশের বিশ্বস্ত WordPress ডেভেলপার প্ল্যাটফর্ম
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition shadow-sm mb-4"
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
            Google দিয়ে লগইন করুন
          </button>

          <div className="relative my-4 text-center">
            <hr className="border-slate-200" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-400">
              অথবা ইমেইল দিয়ে
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">আপনার নাম</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="যেমন: মোঃ সাকিব হোসেন"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                    />
                  </div>
                </div>

                {/* Account Role Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">অ্যাকাউন্ট টাইপ (Role)</label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => {
                        setRole(e.target.value);
                        setError('');
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 appearance-none cursor-pointer"
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
                    <label className="block text-xs font-medium text-slate-700 mb-1">কুপন কোড (Coupon Code)</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="যেমন: VIP2026"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 pl-1">
                      * গেস্ট অ্যাকাউন্টের জন্য অবশ্যই সঠিক কুপন কোড প্রদান করুন।
                    </p>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">ইমেইল এড্রেস</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
            >
              {loading ? 'প্রসেসিং হচ্ছে...' : mode === 'login' ? 'লগইন করুন' : 'সাইন আপ করুন'}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-xs text-slate-600">
            {mode === 'login' ? (
              <p>
                নতুন মেম্বার?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  অ্যাকাউন্ট তৈরি করুন
                </button>
              </p>
            ) : (
              <p>
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  লগইন করুন
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
