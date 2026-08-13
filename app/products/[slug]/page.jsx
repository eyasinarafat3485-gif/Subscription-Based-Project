'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  Download,
  RefreshCw,
  Video,
  Headphones,
  Clock,
  Loader2,
  Star,
  Award,
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function ProductDetailsPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.product) {
            setProduct(data.product);
          }
        }
      } catch (err) {
        console.error('Fetch product details error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProductDetails();
    }
  }, [slug]);

  // Real-time Countdown Timer & Automatic Offer Expiry Check
  useEffect(() => {
    if (!product) return;

    // Use offerEndsAt if set, otherwise default 48h from creation
    const targetDateStr = product.offerEndsAt || (product.isOffer ? new Date(new Date(product.createdAt || Date.now()).getTime() + 48 * 60 * 60 * 1000).toISOString() : null);

    if (!targetDateStr) {
      setIsExpired(false);
      return;
    }

    const targetTime = new Date(targetDateStr).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setIsExpired(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [product]);

  const handleDownloadAction = () => {
    if (product?.downloadUrl) {
      toast.success(`Starting download for ${product.title}...`);
      window.open(product.downloadUrl, '_blank');
    } else {
      toast.info('Preparing download file...');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold">Loading product details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-20 px-4">
          <h2 className="text-2xl font-bold text-slate-800">Product Not Found!</h2>
          <p className="text-slate-500 text-sm">The product you are looking for has been removed, or the URL is incorrect.</p>
          <Link href="/#plugins" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md">
            Return to Products Collection
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Active Price Determination
  const isOfferActive = product.isOffer && !isExpired;
  const hasDiscount = product.regularPrice && Number(product.regularPrice) > Number(product.price);
  const currentPrice = product.price;

  // Qulabi 9 Grid Sample Icons for Showcase Banner Card
  const defaultShowcaseIcons = [
    { name: 'Elementor Pro', color: 'bg-rose-600' },
    { name: 'WoodMart', color: 'bg-emerald-600' },
    { name: 'Astra Pro', color: 'bg-purple-600' },
    { name: 'Dokan Pro', color: 'bg-orange-600' },
    { name: 'CartFlows Pro', color: 'bg-red-500' },
    { name: 'WP Rocket Pro', color: 'bg-amber-600' },
    { name: 'PixelYourSite Pro', color: 'bg-blue-600' },
    { name: 'RankMath Pro', color: 'bg-indigo-600' },
    { name: 'Martfury Theme', color: 'bg-teal-600' },
  ];

  const showcaseItems = product.bundleItems && product.bundleItems.length > 0
    ? product.bundleItems
    : defaultShowcaseIcons;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/#plugins" className="hover:text-blue-600">{product.category || 'Plugins'}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold truncate">{product.title}</span>
        </div>

        {/* Top Product Hero Section (Qulabi 2 Column Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Authentic Qulabi Card Banner Image with Developers Club Branding */}
          <div className="lg:col-span-6 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm relative space-y-4">

            {/* Banner Main Promotional Display Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-500/20">

              {/* Header Branding Logo */}
              <div className="flex flex-col items-center text-center space-y-1 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-500/30">
                    DC
                  </div>
                  <div className="text-left">
                    <span className="text-base font-black tracking-tight text-white block leading-none">
                      Developers <span className="text-blue-400">Club</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">BY BENGAL-IT</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-3">
                  {product.title}
                </h2>
                <div className="px-3.5 py-1 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-200 text-[11px] font-bold">
                  {showcaseItems.length} Premium Themes & Plugins
                </div>
              </div>

              {/* Central Price Pill Container */}
              <div className="my-4 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-2xl bg-white text-slate-900 shadow-lg border-2 border-blue-500">
                  <span className="text-xs font-bold text-slate-500">Only</span>
                  {hasDiscount && (
                    <span className="text-md font-semibold text-slate-700 line-through">৳{product.regularPrice}</span>
                  )}
                  <span className="text-2xl font-black text-blue-600">৳{currentPrice}</span>
                </div>
              </div>

              {/* 9 Grid Product Logo Cards (Exact Qulabi Card Grid Layout) */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 my-6">
                {showcaseItems.slice(0, 10).map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-white/20 text-center space-y-1 text-slate-900 shadow-xs flex flex-col items-center justify-center"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {item.name ? item.name.charAt(0) : 'P'}
                    </div>
                    <span className="text-[10px] font-bold block truncate max-w-full leading-tight text-slate-800">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom 4 Feature Icons Bar (Qulabi Footer Icons Bar) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/10 text-[10px] text-slate-300 text-center font-bold">
                <div className="flex flex-col items-center gap-1">
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Instant Download</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Safe & Secure</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Headphones className="w-4 h-4 text-amber-400" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                  <span>1 Year Free Updates</span>
                </div>
              </div>

            </div>

            {/* Product Image Thumbnail Preview */}
            {product.image && (
              <div className="rounded-xl overflow-hidden border border-slate-200 aspect-16/9 bg-slate-100 shadow-xs">
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Right Column: Product Details, Timer & Dynamic Price Switching Box */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">

            {/* Title & Rating */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {product.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">5.0</span>
                <span className="text-xs text-slate-400 font-medium"> Trusted by 1600+ Customers</span>

                {hasDiscount && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                    {Math.round(((Number(product.regularPrice) - Number(product.price)) / Number(product.regularPrice)) * 100)}% OFF Applied
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Navigation Bar */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700">
              <button className="flex-1 py-2 px-3 rounded-xl bg-white text-slate-900 shadow-xs flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Update Request</span>
              </button>
              <button className="flex-1 py-2 px-3 rounded-xl hover:bg-white transition flex items-center justify-center gap-1.5 text-slate-600 cursor-pointer">
                <Video className="w-3.5 h-3.5 text-indigo-600" />
                <span>Set Up Tutorial</span>
              </button>
              <button className="flex-1 py-2 px-3 rounded-xl hover:bg-white transition flex items-center justify-center gap-1.5 text-slate-600 cursor-pointer">
                <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                <span>24/7 Support</span>
              </button>
            </div>

            {/* Dynamic Price Display */}
            <div className="space-y-3 pt-2">
              <div className="flex items-baseline gap-3">
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through font-bold">৳{product.regularPrice}</span>
                )}
                <span className="text-3xl font-black text-slate-900">৳{currentPrice}</span>
                {product.isOffer && isExpired && (
                  <span className="text-xs text-red-600 font-bold px-2 py-0.5 rounded bg-red-50 border border-red-200">
                    Offer Expired
                  </span>
                )}
              </div>

              <ul className="space-y-2 text-xs text-slate-700 font-semibold">
                {(product.features && product.features.length > 0 ? product.features : [
                  '1 Year FREE Access & Updates',
                  '24/7 Priority Customer Support',
                  '100% Virus & Malware Free',
                  'Unlimited Website Usage',
                  'All Product Latest Version',
                  'Instant Download',
                  'License GPL'
                ]).map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Limited Time Offer Countdown Box (AUTO HIDES / EXPIRES ON TIMER END) */}
            {product.isOffer && (
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${isExpired ? 'bg-slate-100 border-slate-300 text-slate-500' : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Clock className={`w-4 h-4 ${isExpired ? 'text-slate-500' : 'text-rose-600 animate-pulse'}`} />
                  <span>{isExpired ? 'Offer Expired!' : 'Limited Offers!'}</span>
                </span>

                {isExpired ? (
                  <span className="text-xs font-bold text-slate-600">Mega offer has ended</span>
                ) : (
                  <div className="flex items-center gap-2 text-center text-xs font-mono font-black">
                    <div className="bg-rose-600 text-white px-2 py-1 rounded-lg min-w-[32px]">
                      {String(timeLeft.days).padStart(2, '0')}
                      <span className="block text-[8px] font-sans font-normal uppercase leading-none">Days</span>
                    </div>
                    <span>:</span>
                    <div className="bg-rose-600 text-white px-2 py-1 rounded-lg min-w-[32px]">
                      {String(timeLeft.hours).padStart(2, '0')}
                      <span className="block text-[8px] font-sans font-normal uppercase leading-none">Hours</span>
                    </div>
                    <span>:</span>
                    <div className="bg-rose-600 text-white px-2 py-1 rounded-lg min-w-[32px]">
                      {String(timeLeft.minutes).padStart(2, '0')}
                      <span className="block text-[8px] font-sans font-normal uppercase leading-none">Mins</span>
                    </div>
                    <span>:</span>
                    <div className="bg-rose-600 text-white px-2 py-1 rounded-lg min-w-[32px]">
                      {String(timeLeft.seconds).padStart(2, '0')}
                      <span className="block text-[8px] font-sans font-normal uppercase leading-none">Secs</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Buy Now / Download Primary Action Button */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleDownloadAction}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Buy Now ৳{currentPrice} (Download)</span>
              </button>

              {/* Secure Payment Gateway Logos & Guarantee Badge */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Secure Direct Download</span>
                </div>
                <span className="text-slate-400">30 Days Money Back Guarantee</span>
              </div>
            </div>

          </div>
        </div>

        {/* Key Highlights Banner Bar */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-xs">
          <div className="flex items-center gap-3 p-2">
            <Award className="w-7 h-7 text-blue-600 shrink-0" />
            <div className="text-left">
              <p className="font-black text-slate-900">Original GPL Files</p>
              <p className="text-[10px] text-slate-400 font-medium">100% Verified & Clean</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <RefreshCw className="w-7 h-7 text-indigo-600 shrink-0" />
            <div className="text-left">
              <p className="font-black text-slate-900">1 Year Updates</p>
              <p className="text-[10px] text-slate-400 font-medium">Always Up to Date</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <Zap className="w-7 h-7 text-emerald-600 shrink-0" />
            <div className="text-left">
              <p className="font-black text-slate-900">Unlimited Usage</p>
              <p className="text-[10px] text-slate-400 font-medium">For Unlimited Websites</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <Headphones className="w-7 h-7 text-amber-500 shrink-0" />
            <div className="text-left">
              <p className="font-black text-slate-900">24/7 Support</p>
              <p className="text-[10px] text-slate-400 font-medium">We're Here to Help</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <Download className="w-7 h-7 text-purple-600 shrink-0" />
            <div className="text-left">
              <p className="font-black text-slate-900">Instant Download</p>
              <p className="text-[10px] text-slate-400 font-medium">Get Access Immediately</p>
            </div>
          </div>
        </div>

        {/* Bundle Items List ("Included in this Bundle") */}
        {product.bundleItems && product.bundleItems.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Included in this Bundle
              </h3>
              <div className="w-16 h-1 bg-blue-600 rounded-full mx-auto" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {product.bundleItems.map((subItem, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-2 hover:border-blue-300 transition">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-black text-lg flex items-center justify-center mx-auto border border-blue-100 shadow-2xs">
                    {subItem.name ? subItem.name.charAt(0) : 'P'}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{subItem.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{subItem.version || 'v1.0.0'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
