'use client';

import Link from 'next/link';
import { Star, Sparkles, Crown, CheckCircle2, ArrowRight } from 'lucide-react';

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
    iconBg: 'bg-indigo-50 text-indigo-600',
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
    iconBg: 'bg-indigo-50 text-indigo-600',
    badge: 'MOST POPULAR',
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
    iconBg: 'bg-purple-50 text-purple-600',
    badge: 'BEST VALUE',
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

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 bg-slate-50/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Choose Your Membership Plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Select the perfect plan for your needs. All plans include Access All Product!
            </p>
          </div>

          <Link
            href="/membership"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
          >
            <span>View Full Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Cards Grid (Matching User Screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between relative group hover:shadow-2xl ${plan.highlight
                    ? 'border-2 border-indigo-600 shadow-xl scale-102 lg:-translate-y-2 z-10'
                    : 'border-slate-200 shadow-sm hover:border-slate-300'
                  }`}
              >
                {/* Featured Badge */}
                {plan.badge && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </span>
                )}

                <div>
                  {/* Icon & Discount Badge Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.iconBg}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                      {plan.discount}
                    </span>
                  </div>

                  {/* Title & Pricing */}
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {plan.title}
                  </h3>

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

                  {/* Features Checkmark List */}
                  <ul className="mt-6 space-y-3.5 text-xs font-bold text-slate-700">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{plan.support}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
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

                {/* Get Started Button */}
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
    </section>
  );
}
