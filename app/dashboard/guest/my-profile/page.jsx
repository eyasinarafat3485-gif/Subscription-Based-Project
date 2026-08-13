'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { User, Mail, Save, CheckCircle, Camera, Lock, Loader2, Ticket } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function GuestMyProfilePage() {
  const { data: session } = useSession();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    image: '',
    coupon: 'DEVGUEST2026-X89A',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await fetch('/api/user/profile');
        if (res.ok && isSubscribed) {
          const data = await res.json();
          if (data?.user) {
            setFormData((prev) => ({
              ...prev,
              name: data.user.name || session?.user?.name || '',
              email: data.user.email || session?.user?.email || '',
              image: data.user.image || session?.user?.image || '',
            }));
          }
        } else if (session?.user && isSubscribed) {
          setFormData((prev) => ({
            ...prev,
            name: session.user.name || '',
            email: session.user.email || '',
            image: session.user.image || '',
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isSubscribed) setFetching(false);
      }
    };

    fetchProfile();
    return () => {
      isSubscribed = false;
    };
  }, [session]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('ছবি ফাইল সাইজ সর্বোচ্চ 2MB হতে হবে!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
        toast.info('নতুন প্রোফাইল ছবি প্রিভিউ হচ্ছে, সেভ করুন বাটন প্রেস করুন');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSaved(true);
        toast.success(data.message || 'প্রোফাইল ডাটাবেজে সেভ হয়েছে!');
        localStorage.setItem('user_profile', JSON.stringify(data.user));
        window.dispatchEvent(new Event('profileUpdated'));
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(data.error || 'প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভার কানেকশন এরর!');
    } finally {
      setLoading(false);
    }
  };

  const isPageLoading = !mounted || fetching;

  return (
    <div className="space-y-6 max-w-4xl relative">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">মাই প্রোফাইল (Guest Profile)</h1>
        <p className="text-slate-500 text-xs mt-1">আপনার গেস্ট অ্যাকাউন্ট তথ্য ও কুপন এক্সেস দেখুন</p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 relative min-h-[350px]">
        {isPageLoading ? (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-slate-500 z-20 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-semibold">প্রোফাইল লোড হচ্ছে...</p>
          </div>
        ) : null}

        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt={formData.name || 'Guest'}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-amber-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-amber-500 text-white font-black text-3xl flex items-center justify-center border-4 border-amber-400 shadow-md">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'G'}
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                title="ছবি আপলোড করুন"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {formData.name || 'Guest User'}
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black">
                  GUEST PASS
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{formData.email}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>প্রোফাইল ছবি আপলোড করুন</span>
              </button>
            </div>
          </div>

          <Link
            href="/#pricing"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
          >
            <span>PRO এ আপগ্রেড করুন</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">আপনার নাম</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
                <span>ইমেইল এড্রেস</span>
                <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  রিড-অনলি
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-500 font-medium cursor-not-allowed select-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">এক্টিভেটেড কুপন কোড</label>
            <div className="relative">
              <input
                type="text"
                value={formData.coupon}
                disabled
                className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3.5 py-2.5 text-blue-600 font-mono font-bold cursor-not-allowed select-none"
              />
              <Ticket className="w-4 h-4 text-blue-500 absolute right-3 top-3" />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <CheckCircle className="w-4 h-4 text-emerald-300" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'ডাটাবেজে সেভ হচ্ছে...' : saved ? 'ডাটাবেজে সেভ হয়েছে' : 'সেভ করুন (Save Changes)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
