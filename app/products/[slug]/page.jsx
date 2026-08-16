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
  Lock,
  Eye,
  Gift
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSession } from '@/lib/auth-client';

export default function ProductDetailsPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data: session } = useSession();

  // Synchronize name and email from logged-in user's session
  useEffect(() => {
    if (session?.user) {
      setNameInput(session.user.name || '');
      setEmailInput(session.user.email || '');
    }
  }, [session]);

  // Deterministic BDT date and time formatter to avoid hydration mismatches
  const formatBDTDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('en-US', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Load saved reviewer name and email from localStorage on mount (only for guests if no session)
  useEffect(() => {
    if (!session?.user) {
      const savedName = localStorage.getItem('reviewer_name');
      const savedEmail = localStorage.getItem('reviewer_email');
      if (savedName) setNameInput(savedName);
      if (savedEmail) setEmailInput(savedEmail);
      if (savedName || savedEmail) setSaveInfo(true);
    }
  }, [session]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${slug}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchReviews();
    }
  }, [slug]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !nameInput.trim() || !emailInput.trim()) {
      toast.error('Please fill in all fields!');
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: ratingInput,
          comment: commentInput,
          name: nameInput,
          email: emailInput,
          userImage: session?.user?.image || '',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Review submitted successfully!');
        setCommentInput('');
        setRatingInput(5); // reset rating input
        
        // Handle saving info in localStorage
        if (saveInfo) {
          localStorage.setItem('reviewer_name', nameInput.trim());
          localStorage.setItem('reviewer_email', emailInput.trim());
        } else {
          localStorage.removeItem('reviewer_name');
          localStorage.removeItem('reviewer_email');
          setNameInput('');
          setEmailInput('');
        }

        fetchReviews();
        if (data.updatedProductStats) {
          setProduct(prev => ({
            ...prev,
            rating: data.updatedProductStats.rating,
            reviewsCount: data.updatedProductStats.reviewsCount,
          }));
        }
      } else {
        toast.error(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Submit review error:', err);
      toast.error('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.product) {
            setProduct(data.product);
            setImageError(false);
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

          {/* Left Column: Product Image Box (2nd screenshot style) */}
          <div className="lg:col-span-6 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm relative">
            <div className="relative aspect-square w-full bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-center p-4 overflow-hidden group">
              {product.image && !imageError ? (
                <img
                  src={product.image}
                  alt={product.title}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-4xl rounded-xl">
                  {product.title?.charAt(0)}
                </div>
              )}
              
              {/* Top-Right Magnifying Glass Search Icon */}
              <div className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 transition hover:scale-105">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z"
                  />
                </svg>
              </div>
            </div>
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
                  {[...Array(5)].map((_, i) => {
                    const isFilled = i < Math.round(product.rating || 5);
                    return (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    );
                  })}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {product.rating ? product.rating.toFixed(1) : '5.0'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}) • Trusted by 1600+ Customers
                </span>

                {hasDiscount && (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black">
                    {Math.round(((Number(product.regularPrice) - Number(product.price)) / Number(product.regularPrice)) * 100)}% OFF Applied
                  </span>
                )}
              </div>
            </div>

             {/* Quick Action Navigation Bar */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700">
              <a
                href={product.demoUrl || '#'}
                target={product.demoUrl ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-white text-slate-900 shadow-2xs flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 transition text-center cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>View Demo</span>
              </a>
              <button
                onClick={() => toast.info('We have received your update request. Our team will verify and upload the latest version soon!')}
                className="flex-1 py-2 px-3 rounded-xl hover:bg-white transition flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-200 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Update Request</span>
              </button>
              <Link
                href="/contact"
                className="flex-1 py-2 px-3 rounded-xl hover:bg-white transition flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-200 cursor-pointer text-center"
              >
                <Headphones className="w-3.5 h-3.5 text-indigo-600" />
                <span>24/7 Support</span>
              </Link>
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
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
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
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Secure Direct Download</span>
                </div>
                <span className="text-slate-400">30 Days Money Back Guarantee</span>
              </div>

              {/* Download For FREE Promo Box */}
              <div className="p-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl border border-blue-100 shadow-2xs text-blue-600 shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="text-left space-y-0.5">
                    <h4 className="text-xs font-bold text-blue-600">Download For FREE</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-snug">
                      Get this product FREE + access to all premium products for just ৳499 /- Monthly.
                    </p>
                  </div>
                </div>
                <Link
                  href="/#pricing"
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 font-bold text-[10px] shadow-2xs transition flex items-center gap-1.5 shrink-0 justify-center cursor-pointer animate-pulse"
                >
                  <span>→</span>
                  <span>Get Membership</span>
                </Link>
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
            <Zap className="w-7 h-7 text-indigo-600 shrink-0" />
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

        {/* Description & Reviews Tabs */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Tab Buttons */}
          <div className="flex border-b border-slate-200 bg-slate-50/50">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-4 text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === 'description'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Description</span>
              {activeTab === 'description' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Reviews ({reviews.length})</span>
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>

          {/* Tab Panels */}
          <div className="p-6 sm:p-8">
            {activeTab === 'description' ? (
              <div className="space-y-4 text-slate-600 text-xs sm:text-sm leading-relaxed">
                <h4 className="text-base font-black text-slate-900 mb-2">
                  Description
                </h4>
                {product.description ? (
                  <p className="whitespace-pre-line font-medium">{product.description}</p>
                ) : (
                  <p className="font-medium">No description provided for this product.</p>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-6">
                  <h4 className="text-base font-medium text-slate-800">
                    {reviews.length === 0
                      ? 'No reviews yet'
                      : `${reviews.length} review${
                          reviews.length === 1 ? '' : 's'
                        } for ${product.title}`}
                  </h4>

                  {reviews.length > 0 && (
                    <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2 space-y-6">
                      {reviews.map((rev) => (
                        <div key={rev._id} className="pt-5 first:pt-0 flex gap-4 items-start justify-between">
                          <div className="flex gap-4 items-start">
                            {/* Circular Avatar */}
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100 shadow-2xs uppercase text-sm shrink-0 relative">
                              {rev.userImage ? (
                                <img
                                  src={rev.userImage}
                                  alt={rev.name}
                                  className="w-full h-full object-cover absolute inset-0"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const sibling = e.target.nextSibling;
                                    if (sibling) sibling.style.display = 'block';
                                  }}
                                />
                              ) : null}
                              <span style={{ display: rev.userImage ? 'none' : 'block' }}>
                                {rev.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            
                            {/* Review Details */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-800">{rev.name}</span>
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                  Verified Owner
                                </span>
                              </div>
                              
                              <p className="text-[10px] text-slate-400 font-medium">
                                {formatBDTDateTime(rev.createdAt)}
                              </p>
                              
                              <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
                                {rev.comment}
                              </p>
                            </div>
                          </div>

                          {/* Rating Stars on Right */}
                          <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Review Form */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">Add a review</h4>
                    {!session?.user ? (
                      <p className="text-[11px] text-slate-500">
                        You must be logged in to submit a review.
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        Your email address will not be published. Required fields are marked *
                      </p>
                    )}
                  </div>

                  {!session?.user ? (
                    <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-slate-200/50">
                      <p className="text-xs text-slate-500 font-medium mb-3">Please sign in to write a review for this product.</p>
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                      >
                        Login Now
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {/* Rating Selector */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Your rating *</label>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => {
                            const starVal = i + 1;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setRatingInput(starVal)}
                                className="hover:scale-110 transition cursor-pointer"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    starVal <= ratingInput 
                                      ? 'fill-amber-400 text-amber-400 stroke-amber-400' 
                                      : 'text-teal-600 stroke-teal-600'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Comment Textarea */}
                      <div className="space-y-1.5">
                        <label htmlFor="comment" className="block text-xs font-bold text-slate-700">
                          Your review *
                        </label>
                        <textarea
                          id="comment"
                          rows={4}
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          required
                          className="w-full rounded border border-slate-300 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition font-normal"
                          placeholder="Write your review here..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name Input */}
                        <div className="space-y-1.5">
                          <label htmlFor="name" className="block text-xs font-bold text-slate-700">
                            Name *
                          </label>
                          <input
                            id="name"
                            type="text"
                            value={nameInput}
                            required
                            readOnly
                            className="w-full rounded border border-slate-300 bg-slate-100/90 px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed font-semibold focus:outline-none transition"
                            placeholder="Your Name"
                          />
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1.5">
                          <label htmlFor="email" className="block text-xs font-bold text-slate-700">
                            Email *
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={emailInput}
                            required
                            readOnly
                            className="w-full rounded border border-slate-300 bg-slate-100/90 px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed font-semibold focus:outline-none transition"
                            placeholder="Your Email"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-6 py-2.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {submittingReview ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <span>Submit</span>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
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
