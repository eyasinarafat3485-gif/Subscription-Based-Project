'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Testimonials from '@/components/Testimonials';
import {
  Sparkles,
  CheckCircle2,
  Star,
  Crown,
  Zap,
  Clock,
  ShieldCheck,
  Users,
  Layers,
  Activity,
  Headphones,
  ArrowRight,
  Quote
} from 'lucide-react';

export default function MembershipPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [offerTimeLeft, setOfferTimeLeft] = useState({ days: 0, hours: 23, minutes: 45, seconds: 30 });
  const [subTimeLeft, setSubTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isLifetime: false });

  // Load User Profile and active membership status
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const stored = localStorage.getItem('user_membership');
        if (stored) {
          const parsed = JSON.parse(stored);
          setActiveSubscription(parsed);
        }

        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUserProfile(data.user);
            if (data.user.membership) {
              setActiveSubscription(data.user.membership);
              localStorage.setItem('user_membership', JSON.stringify(data.user.membership));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile for membership:', err);
      }
    };

    fetchUser();
  }, []);

  // 1. Dynamic Looping Countdown Timer for Limited Offer Banner (Auto-renews when reaches 0)
  useEffect(() => {
    const CYCLE_MS = (1 * 24 * 3600 + 23 * 3600 + 59 * 60 + 59) * 1000; // 1 Day 23 Hours 59 Min 59 Sec

    const getTargetTime = () => {
      try {
        const stored = localStorage.getItem('offer_countdown_target');
        if (stored) {
          const target = parseInt(stored, 10);
          if (target > Date.now()) {
            return target;
          }
        }
      } catch (e) { }

      const newTarget = Date.now() + CYCLE_MS;
      try {
        localStorage.setItem('offer_countdown_target', newTarget.toString());
      } catch (e) { }
      return newTarget;
    };

    let targetTime = getTargetTime();

    const updateTimer = () => {
      const now = Date.now();
      let diff = targetTime - now;

      if (diff <= 0) {
        // Auto renew loop: reset to 1 Day 23 Hours 59 Mins
        targetTime = now + CYCLE_MS;
        try {
          localStorage.setItem('offer_countdown_target', targetTime.toString());
        } catch (e) { }
        diff = CYCLE_MS;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setOfferTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  // 2. Dynamic Countdown Timer for User's Active Membership Subscription
  useEffect(() => {
    if (!activeSubscription || !activeSubscription.expiresAt) return;

    if (activeSubscription.expiresAt === 'LIFETIME' || activeSubscription.planId === 'premium') {
      setSubTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLifetime: true });
      return;
    }

    const expiryMs = new Date(activeSubscription.expiresAt).getTime();

    const interval = setInterval(() => {
      const nowMs = Date.now();
      const diff = expiryMs - nowMs;

      if (diff <= 0) {
        setSubTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLifetime: false });
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setSubTimeLeft({ days, hours, minutes, seconds, isLifetime: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSubscription]);

  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    totalReviews: 24,
    averageRating: 4.9,
    ratingText: 'Excellent',
    trustpilotUrl: 'https://www.trustpilot.com/review/developersclub.com',
  });

  // Fetch dynamic reviews and calculated average score from database
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (data?.reviews) {
            setReviewsData(data);
          }
        }
      } catch (err) {
        console.error('Failed to load site reviews:', err);
      }
    };

    fetchReviews();
  }, []);

  const plans = [
    {
      id: 'basic',
      title: 'Basic',
      price: '499',
      regularPrice: '899',
      discount: '45% OFF',
      billing: 'Monthly',
      downloads: '5 Downloads per Day',
      support: '24/7 Priority Support',
      icon: Star,
      iconBg: 'bg-indigo-500/10 text-indigo-600',
      badge: 'TOP TRENDING',
      highlight: false,
    },
    {
      id: 'standard',
      title: 'Standard',
      price: '999',
      regularPrice: '2199',
      discount: '55% OFF',
      billing: 'Yearly',
      downloads: '10 Downloads per Day',
      support: '24/7 Priority Support',
      icon: Sparkles,
      iconBg: 'bg-indigo-600/10 text-indigo-600',
      badge: 'Most Popular',
      highlight: true,
    },
    {
      id: 'premium',
      title: 'Premium',
      price: '1999',
      regularPrice: '5199',
      discount: '62% OFF',
      billing: 'Lifetime',
      downloads: '20 Downloads per Day',
      support: '24/7 Dedicated Support',
      icon: Crown,
      iconBg: 'bg-purple-600/10 text-purple-600',
      badge: 'Best Value',
      highlight: false,
    },
  ];

  const commonFeatures = [
    'Get Instant Access',
    'Unlimited Domain Use',
    'Access All Product',
    'Installation Tutorial',
    'Free Regular Update',
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white flex flex-col justify-between">
      <div>
        <Header />

        <main className="pb-20">

          {/* Active Membership Live Banner (If User Has Active Membership) */}
          {activeSubscription && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/30 py-4 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-center md:text-left">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-400/30">
                        Active Membership
                      </span>
                      <span className="text-xs text-slate-300 font-bold">
                        Order #{activeSubscription.orderId || 'SUCCESS'}
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                      {activeSubscription.planTitle || 'Developers Club Member'}
                    </h2>
                  </div>
                </div>

                {/* Live Subscription Timer Display */}
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl px-5 py-2.5 flex items-center gap-4 shadow-lg backdrop-blur-md">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Remaining Time</p>
                    <p className="text-xs font-extrabold text-indigo-400">
                      {subTimeLeft.isLifetime ? 'Unlimited Access' : 'Auto Renew Active'}
                    </p>
                  </div>

                  {subTimeLeft.isLifetime ? (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black px-4 py-1.5 rounded-xl text-xs shadow-md">
                      <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                      <span>LIFETIME UNLIMITED</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 font-mono font-black text-sm text-white">
                      <div className="text-center px-2 py-1 bg-slate-800 rounded-lg border border-slate-700">
                        <span className="text-indigo-400">{String(subTimeLeft.days).padStart(2, '0')}</span>
                        <span className="block text-[8px] font-sans text-slate-400 uppercase">Days</span>
                      </div>
                      <span>:</span>
                      <div className="text-center px-2 py-1 bg-slate-800 rounded-lg border border-slate-700">
                        <span className="text-indigo-400">{String(subTimeLeft.hours).padStart(2, '0')}</span>
                        <span className="block text-[8px] font-sans text-slate-400 uppercase">Hrs</span>
                      </div>
                      <span>:</span>
                      <div className="text-center px-2 py-1 bg-slate-800 rounded-lg border border-slate-700">
                        <span className="text-indigo-400">{String(subTimeLeft.minutes).padStart(2, '0')}</span>
                        <span className="block text-[8px] font-sans text-slate-400 uppercase">Min</span>
                      </div>
                      <span>:</span>
                      <div className="text-center px-2 py-1 bg-slate-800 rounded-lg border border-slate-700">
                        <span className="text-indigo-400 animate-pulse">{String(subTimeLeft.seconds).padStart(2, '0')}</span>
                        <span className="block text-[8px] font-sans text-slate-400 uppercase">Sec</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section Header */}
          <div className="text-center pt-12 pb-8 px-4 max-w-3xl mx-auto space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Choose Your Membership Plan
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              Select the perfect plan for your needs. All plans include Access All Product!
            </p>
          </div>

          {/* Limited Offers Banner Box (Matching Reference Image 1) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
            <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-blue-50/80 border border-indigo-200/80 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-red-500 font-black">Limited</span>
                  <span>Offers!</span>
                </h3>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Hurry Up To Buy These Membership With Discount.
                </p>
              </div>

              {/* Offer Countdown Clock Boxes */}
              <div className="flex items-center gap-2 sm:gap-3 font-mono">
                <div className="bg-white border border-slate-200 rounded-xl px-3 sm:px-4 py-2 text-center shadow-xs min-w-[54px]">
                  <span className="text-base sm:text-lg font-black text-red-500 block leading-tight">
                    {String(offerTimeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-sans font-extrabold text-slate-400 uppercase">Days</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-3 sm:px-4 py-2 text-center shadow-xs min-w-[54px]">
                  <span className="text-base sm:text-lg font-black text-red-500 block leading-tight">
                    {String(offerTimeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-sans font-extrabold text-slate-400 uppercase">Hours</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-3 sm:px-4 py-2 text-center shadow-xs min-w-[54px]">
                  <span className="text-base sm:text-lg font-black text-red-500 block leading-tight">
                    {String(offerTimeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-sans font-extrabold text-slate-400 uppercase">Minutes</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-3 sm:px-4 py-2 text-center shadow-xs min-w-[54px]">
                  <span className="text-base sm:text-lg font-black text-red-500 block leading-tight">
                    {String(offerTimeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-sans font-extrabold text-slate-400 uppercase">Seconds</span>
                </div>
              </div>
            </div>
          </div>

          {/* Membership 3 Cards Grid (Matching Reference Image 1 Layout) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {plans.map((plan) => {
                const IconComponent = plan.icon;
                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between relative group hover:shadow-2xl ${plan.highlight
                      ? 'border-2 border-indigo-600 shadow-xl scale-102 lg:-translate-y-2'
                      : 'border-slate-200 shadow-sm hover:border-slate-300'
                      }`}
                  >
                    {/* Featured Badge */}
                    {plan.badge && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                        {plan.badge}
                      </span>
                    )}

                    <div>
                      {/* Top Header info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.iconBg}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80">
                          {plan.discount}
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {plan.title}
                      </h3>

                      {/* Pricing Display */}
                      <div className="mt-3 pb-6 border-b border-slate-100">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            ৳ {plan.price}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">
                            /- {plan.billing}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-through mt-1 font-semibold">
                          ৳ {plan.regularPrice}/-
                        </p>
                      </div>

                      {/* Features List */}
                      <ul className="mt-6 space-y-3.5 text-xs font-semibold text-slate-600">
                        <li className="flex items-center gap-2.5 text-slate-900 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>{plan.support}</span>
                        </li>
                        <li className="flex items-center gap-2.5 text-slate-900 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>{plan.downloads}</span>
                        </li>
                        {commonFeatures.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div className="mt-8 pt-4">
                      <Link
                        href={`/checkout?plan=${plan.id}`}
                        className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 ${plan.highlight
                          ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25 hover:shadow-indigo-500/40'
                          : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                          }`}
                      >
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trust Stats Bar (Matching Image 1) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-slate-900 block leading-tight">1500+</span>
                  <span className="text-[11px] font-bold text-slate-500">Happy Members</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-slate-900 block leading-tight">5000+</span>
                  <span className="text-[11px] font-bold text-slate-500">Themes & Plugins</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-slate-900 block leading-tight">99.9%</span>
                  <span className="text-[11px] font-bold text-slate-500">Uptime Guarantee</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-slate-900 block leading-tight">24/7</span>
                  <span className="text-[11px] font-bold text-slate-500">Dedicated Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Section (Same to Same as Home Page) */}
          <Testimonials />

        </main>
      </div>

      <Footer />
    </div>
  );
}
