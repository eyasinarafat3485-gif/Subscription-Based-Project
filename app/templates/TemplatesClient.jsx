'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryBannerCTA from '@/components/CategoryBannerCTA';
import {
  Eye,
  BookOpen,
  ShoppingBag,
  Loader2,
  Sparkles,
  Layout,
  ExternalLink,
  CheckCircle2,
  FolderKanban,
  Menu
} from 'lucide-react';

const TEMPLATE_TABS = [
  { id: 'All', label: 'All' },
  { id: 'Ecommerce', label: 'Ecommerce Website' },
  { id: 'Business', label: 'Business Website' },
  { id: 'Blog', label: 'Blog Website' },
  { id: 'Landing Page', label: 'Landing Page' },
];

import ConfirmDownloadModal from '@/components/ConfirmDownloadModal';

function TemplateCardImage({ item }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTallImage, setIsTallImage] = useState(false);

  const mainImg = item.image;
  const hoverImg = item.previewImage || item.secondImage || item.landingImage;
  const activeHoverImg = hoverImg || mainImg;
  const has2ndImg = Boolean(hoverImg && hoverImg !== mainImg);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth > 0 && naturalHeight > 0) {
      if (naturalHeight / naturalWidth > 1.25) {
        setIsTallImage(true);
      } else {
        setIsTallImage(false);
      }
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[420px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200/80 group-hover:border-indigo-500/50 transition cursor-pointer select-none"
    >
      {activeHoverImg ? (
        <>
          {/* Main 1st Image (Normal State) */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${has2ndImg && isHovered ? 'opacity-0' : 'opacity-100'}`}>
            <img
              src={mainImg || activeHoverImg}
              alt={item.title}
              onLoad={handleImageLoad}
              style={{
                imageRendering: '-webkit-optimize-contrast',
                backfaceVisibility: 'hidden',
                filter: 'contrast(102%) brightness(101%)',
              }}
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* 2nd Image or Landing Page Full Screenshot (Hover Scroll State) */}
          <div className={`absolute inset-0 overflow-hidden transition-opacity duration-300 ${has2ndImg ? (isHovered ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none') : 'z-10'}`}>
            <img
              src={activeHoverImg}
              alt={`${item.title} preview`}
              onLoad={handleImageLoad}
              style={
                isTallImage
                  ? {
                      transform: isHovered ? 'translateY(calc(-100% + 420px))' : 'translateY(0px)',
                      transition: isHovered ? 'transform 6500ms cubic-bezier(0.25, 1, 0.5, 1)' : 'transform 1000ms ease-out',
                      willChange: 'transform',
                      imageRendering: '-webkit-optimize-contrast',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      filter: 'contrast(102%) brightness(101%)',
                    }
                  : {
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      transition: 'transform 500ms ease-out',
                      imageRendering: '-webkit-optimize-contrast',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      filter: 'contrast(102%) brightness(101%)',
                    }
              }
              className={isTallImage ? "w-full h-auto object-top absolute top-0 left-0" : "w-full h-full object-cover object-top"}
            />
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-tr from-slate-800 via-indigo-950 to-blue-900 flex flex-col items-center justify-center p-6 text-center text-white">
          <Layout className="w-12 h-12 mb-3 text-indigo-400 opacity-80" />
          <h4 className="font-extrabold text-sm line-clamp-2">{item.title}</h4>
        </div>
      )}

      {/* Category Badge */}
      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200/80 shadow-xs z-20">
        Readymade Site
      </span>

      {/* Subtle "Hover to view full site" badge */}
      {has2ndImg && (
        <span className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-md z-20 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-80'}`}>
          Hover to view full site
        </span>
      )}
    </div>
  );
}

export default function TemplatesClient() {
  const { data: session } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [userMembership, setUserMembership] = useState(null);
  const [selectedProductForDownload, setSelectedProductForDownload] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const loaderRef = useRef(null);
  const BATCH_SIZE = 16;

  useEffect(() => {
    document.title = 'Templates | Developers Club';
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.membership && (data.user.membership.status === 'active' || !data.user.membership.status)) {
            setUserMembership(data.user.membership);
          } else {
            setUserMembership(null);
          }
        }
      } catch (err) { }
    };
    if (session?.user) {
      fetchUser();
    }
    const handleProfileUpdate = () => fetchUser();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [session]);

  const handleBuyNowClick = (e, item) => {
    if (!session?.user) {
      e.preventDefault();
      router.push(`/login?redirectTo=${encodeURIComponent(`/checkout?product=${item.slug}`)}`);
      return;
    }
    if (userMembership && (userMembership.status === 'active' || !userMembership.status)) {
      e.preventDefault();
      setSelectedProductForDownload(item);
      setIsConfirmModalOpen(true);
    }
  };

  const handleProtectedAction = (e, targetUrl) => {
    if (!session?.user) {
      e.preventDefault();
      router.push(`/login?redirectTo=${encodeURIComponent(targetUrl)}`);
    }
  };

  // Fetch Readymade Website Templates
  const fetchTemplates = async (tab = activeTab, pageNum = 1, isAppend = false) => {
    try {
      if (isAppend) {
        setLoadingMore(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        setLoading(true);
      }

      let url = `/api/products?page=${pageNum}&limit=${BATCH_SIZE}`;
      
      if (tab && tab !== 'All') {
        url += `&category=${encodeURIComponent(tab)}`;
      } else {
        url += `&category=Templates`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const items = data.products || [];

        setTotalProducts(data.totalProducts || items.length);

        if (isAppend) {
          setProducts((prev) => [...prev, ...items]);
        } else {
          setProducts(items);
        }

        setHasMore(pageNum < (data.totalPages || 1));
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchTemplates(activeTab, 1, false);
  }, [activeTab]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTemplates(activeTab, nextPage, true);
  };

  // Auto-trigger next batch loading with 2s spinner when scrolled near bottom
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col justify-between">
      <div>
        <Header />

        {/* Top Dynamic Category Banner CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col xl:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Menu className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Readymade Templates
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {totalProducts || products.length} Products Available
                </p>
              </div>
            </div>

            {/* Dynamic Right Side: Active Membership Countdown Box OR Default Promo */}
            <CategoryBannerCTA />
          </div>
        </section>

        {/* Main Product Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading ? (
            <div className="w-full py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <p className="text-xs font-bold text-slate-500">
                Loading Readymade Website Templates...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="w-full py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex flex-col items-center justify-center">
              <FolderKanban className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-black text-slate-800">
                No Readymade Templates Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore available ready-to-use WordPress website templates.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              
              {/* 3-Column Vertical Website Preview Grid (Matching Reference Screenshot) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
                {products.map((item) => {
                  const demoUrl = item.demoUrl || `/products/${item.slug}`;
                  const docUrl = item.docUrl || `/products/${item.slug}`;

                  return (
                    <div
                      key={item._id ? item._id.toString() : item.slug}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col justify-between"
                    >
                      {/* Tall Scrolling Preview Container */}
                      <div className="p-3.5 pb-0">
                        <TemplateCardImage item={item} />
                      </div>

                      {/* Card Content & Action Buttons (Matching Brand Theme Color) */}
                      <div className="p-4 space-y-3">
                        <h3 className="text-sm font-extrabold text-slate-900 text-center line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </h3>

                        {/* Button Row 1: Live Preview & Setup Guide */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <a
                            href={demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] border border-indigo-600/80 text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Live Preview</span>
                          </a>

                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] border border-indigo-600/80 text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Setup Guide</span>
                          </a>
                        </div>

                        {/* Button Row 2: Buy Now Button (Full Width Project Indigo Theme) */}
                        <Link
                          href={`/checkout?product=${item.slug}`}
                          onClick={(e) => handleBuyNowClick(e, item)}
                          className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs text-center shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{userMembership ? 'Download' : 'Buy Now'}</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Standalone Auto-Loader Spinner */}
              {hasMore && (
                <div ref={loaderRef} className="py-10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-800 stroke-[2.5]" />
                </div>
              )}

            </div>
          )}

        </main>

        <ConfirmDownloadModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          product={selectedProductForDownload}
          userMembership={userMembership}
        />
      </div>

      <Footer />
    </div>
  );
}
