'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2, Quote } from 'lucide-react';

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(4.9);
  const [totalReviews, setTotalReviews] = useState(24);
  const [ratingText, setRatingText] = useState('Excellent');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        if (data.reviews) {
          setReviews(data.reviews);
          setAverageRating(data.averageRating || 4.9);
          setTotalReviews(data.totalReviews || data.reviews.length);
          setRatingText(data.ratingText || 'Excellent');
        }
      }
    } catch (err) {
      console.error('Failed to fetch reviews from reviews collection:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Duplicate reviews to create a seamless 100% infinite loop marquee
  const displayReviews = reviews.length > 0 ? [...reviews, ...reviews] : [];

  return (
    <section className="pt-16 bg-slate-50/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Section Header */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Member Reviews & Rating
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Authentic feedback from verified Developers Club members</p>
        </div>

        {/* Main Grid: Left Rating Summary Box + Right Infinite Marquee Carousel */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-semibold">Loading reviews from database collection...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">

            {/* Left Box: Rating Summary Box */}
            <div className="lg:col-span-1 bg-white rounded-2xl p-2 border border-slate-200 shadow-2xs flex flex-col items-center justify-center text-center">
              <div className="space-y-2 w-full">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{ratingText}</h3>

                {/* Dynamic Partial-Fill Square Box Stars */}
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const fillPercent = Math.max(0, Math.min(100, (averageRating - (star - 1)) * 100));

                    return (
                      <div
                        key={star}
                        className="w-6 h-6 rounded-xs bg-slate-200 relative overflow-hidden flex items-center justify-center shrink-0 shadow-2xs"
                      >
                        <div
                          className="absolute inset-y-0 left-0 bg-amber-400"
                          style={{ width: `${fillPercent}%` }}
                        />
                        <Star className="w-3.5 h-3.5 fill-white text-white relative z-10" />
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-slate-600 font-medium pt-1">
                  <strong className="text-slate-900 font-extrabold">{averageRating}</strong> out of 5 based on <strong className="text-slate-900 font-extrabold">{totalReviews}</strong> reviews
                </p>

                {/* Verified Club Badge - Directly under text with tight border-t */}
                <div className="pt-3 mt-3 border-t border-slate-100 w-full flex items-center justify-center gap-1.5 text-blue-600 font-black text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="tracking-tight text-slate-900 font-extrabold">Verified Member Reviews</span>
                </div>
              </div>
            </div>

            {/* Right Section: Continuous Silky-Smooth Infinite Right-to-Left Marquee Carousel */}
            <div className="lg:col-span-3 overflow-hidden relative rounded-2xl flex items-center">
              {/* Fade Edge Gradient Masks */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50/90 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50/90 to-transparent z-10 pointer-events-none" />

              <div className="animate-marquee gap-4 py-1">
                {displayReviews.map((r, idx) => {
                  const avatarSrc =
                    r.avatar ||
                    r.image ||
                    r.userImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || 'User')}&background=2563eb&color=fff`;

                  return (
                    <div
                      key={r._id ? `${r._id}-${idx}` : idx}
                      className="w-[280px] sm:w-[320px] shrink-0 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between select-none"
                    >
                      <div>
                        {/* Quote Icon */}
                        <Quote className="w-6 h-6 text-blue-500/40 block mb-2 rotate-180" />

                        {/* Comment Quote */}
                        <p className="text-xs text-slate-700 font-medium leading-relaxed italic line-clamp-4 min-h-[64px]">
                          "{r.comment || r.quote}"
                        </p>
                      </div>

                      {/* Author Footer (Avatar + Name + Amber Stars) */}
                      <div className="flex items-center gap-3 pt-4 mt-3 border-t border-slate-100">
                        <img
                          src={avatarSrc}
                          alt={r.name || 'Member'}
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || 'User')}&background=2563eb&color=fff`;
                          }}
                          className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 shrink-0 shadow-2xs"
                        />

                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-xs font-extrabold text-slate-900 truncate max-w-[150px]">
                            {r.name || 'Anonymous Member'}
                          </h4>

                          {/* Amber Stars */}
                          <div className="flex items-center gap-0.5">
                            {[...Array(Math.floor(Number(r.rating) || 5))].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
