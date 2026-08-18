'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gift, ShieldCheck, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

export default function CategoryBannerCTA() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subTimeLeft, setSubTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLifetime: false,
    isExpired: false,
  });

  useEffect(() => {
    let isMounted = true;
    let timer = null;

    const fetchProfileMembership = async () => {
      try {
        if (!session?.user) {
          if (isMounted) {
            setActiveSubscription(null);
            localStorage.removeItem('user_membership');
          }
          return;
        }

        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data?.user && isMounted) {
            if (data.user.membership && (data.user.membership.status === 'active' || !data.user.membership.status)) {
              setActiveSubscription(data.user.membership);
              localStorage.setItem('user_membership', JSON.stringify(data.user.membership));
            } else {
              setActiveSubscription(null);
              localStorage.removeItem('user_membership');
            }
          }
        } else if (res.status === 401 && isMounted) {
          setActiveSubscription(null);
          localStorage.removeItem('user_membership');
        }
      } catch (err) {
      } finally {
        timer = setTimeout(() => {
          if (isMounted) setIsLoading(false);
        }, 500);
      }
    };

    if (!isSessionLoading) {
      if (session?.user) {
        fetchProfileMembership();
      } else {
        setActiveSubscription(null);
        localStorage.removeItem('user_membership');
        timer = setTimeout(() => {
          if (isMounted) setIsLoading(false);
        }, 500);
      }
    }

    const handleProfileUpdate = () => {
      const storedMem = localStorage.getItem('user_membership');
      if (storedMem) {
        try {
          const parsed = JSON.parse(storedMem);
          if (parsed && (parsed.status === 'active' || !parsed.status)) {
            setActiveSubscription(parsed);
            setIsLoading(false);
            return;
          }
        } catch (e) {}
      }
      setActiveSubscription(null);
      setIsLoading(false);
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

  // WHILE CHECKING MEMBERSHIP DATA: Render Professional Checking Status Spinner Box
  if (isSessionLoading || isLoading) {
    return (
      <div className="w-full md:w-auto bg-white border border-slate-200/90 rounded-2xl p-3.5 px-6 shadow-2xs flex items-center justify-center gap-2.5 shrink-0 min-h-[64px]">
        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
        <span className="text-xs font-bold text-slate-500">Checking status...</span>
      </div>
    );
  }

  const hasActiveMembership = session?.user && activeSubscription && (activeSubscription.status === 'active' || !activeSubscription.status) && (!subTimeLeft.isExpired || subTimeLeft.isLifetime);

  // IF USER HAS ACTIVE MEMBERSHIP: Render Active Membership Banner (Right Side)
  if (hasActiveMembership) {
    return (
      <div className="w-full xl:w-auto bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 text-center sm:text-left min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/70 whitespace-nowrap shrink-0">
                ACTIVE MEMBERSHIP
              </span>
              <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap">
                Order #{activeSubscription.orderId || 'SUCCESS'}
              </span>
            </div>
            <h2 className="text-sm font-black text-slate-900 leading-tight mt-0.5 whitespace-nowrap truncate">
              {activeSubscription.planTitle || 'Basic Membership Plan'}
            </h2>
          </div>
        </div>

        {/* Live Subscription Timer Display */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3 sm:px-4 py-2 flex items-center gap-2.5 shadow-2xs shrink-0 max-w-full">
          <div className="text-right hidden sm:block whitespace-nowrap">
            <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">REMAINING TIME</p>
            <p className="text-[11px] font-extrabold text-indigo-600">
              {subTimeLeft.isLifetime ? 'Unlimited Access' : 'Auto Renew Active'}
            </p>
          </div>

          {subTimeLeft.isLifetime ? (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black px-3 py-1.5 rounded-xl text-xs shadow-xs whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>LIFETIME UNLIMITED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 font-mono">
              <div className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-center shadow-2xs min-w-[38px]">
                <span className="text-xs sm:text-sm font-black text-red-500 block leading-tight">
                  {String(subTimeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[8px] font-sans font-extrabold text-slate-400 uppercase block leading-none mt-0.5">DAYS</span>
              </div>
              <span className="text-slate-300 font-bold text-xs">:</span>
              <div className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-center shadow-2xs min-w-[38px]">
                <span className="text-xs sm:text-sm font-black text-red-500 block leading-tight">
                  {String(subTimeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[8px] font-sans font-extrabold text-slate-400 uppercase block leading-none mt-0.5">HRS</span>
              </div>
              <span className="text-slate-300 font-bold text-xs">:</span>
              <div className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-center shadow-2xs min-w-[38px]">
                <span className="text-xs sm:text-sm font-black text-red-500 block leading-tight">
                  {String(subTimeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[8px] font-sans font-extrabold text-slate-400 uppercase block leading-none mt-0.5">MIN</span>
              </div>
              <span className="text-slate-300 font-bold text-xs">:</span>
              <div className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-center shadow-2xs min-w-[38px]">
                <span className="text-xs sm:text-sm font-black text-red-500 block leading-tight animate-pulse">
                  {String(subTimeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[8px] font-sans font-extrabold text-slate-400 uppercase block leading-none mt-0.5">SEC</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // DEFAULT STATE (NO ACTIVE MEMBERSHIP / GUEST): Render "Download For FREE" Banner (Right Side)
  return (
    <div className="w-full md:w-auto bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-blue-50/80 border border-dashed border-indigo-300/90 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-3 text-center sm:text-left">
        <div className="w-10 h-10 rounded-xl bg-indigo-100/90 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
          <Gift className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-black text-indigo-900 tracking-tight">
            Download For FREE
          </h3>
          <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
            Get this product FREE + access to all premium products for just <strong className="text-indigo-600 font-black">৳ 499 /- Monthly</strong>.
          </p>
        </div>
      </div>

      <Link
        href="/membership"
        className="px-4 py-2.5 bg-white hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 font-black text-xs rounded-xl border border-indigo-200 shadow-2xs transition flex items-center gap-1.5 shrink-0 hover:scale-102 cursor-pointer"
      >
        <span>Get Membership</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
