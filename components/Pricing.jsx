'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import AuthModal from './AuthModal';
import { useSession } from '@/lib/auth-client';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: '৳ 799',
    period: '/ month',
    isPopular: false,
    features: [
      'Unlimited Downloads',
      'Regular Updates',
      'English Documentation',
      'Standard Support',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: '৳ 5,999',
    period: '/ year',
    isPopular: true,
    badgeText: 'Most Popular',
    features: [
      'Unlimited Downloads',
      'Regular Updates',
      'English Documentation',
      'Standard Support',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime Plan',
    price: '৳ 19,999',
    period: '/ one-time',
    isPopular: false,
    features: [
      'Lifetime Access',
      'All Updates Free',
      'Priority Support',
      'Dedicated Support',
    ],
  },
];

export default function Pricing({ onSelectPlan }) {
  const { data: session } = useSession();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleChoosePlan = (plan) => {
    if (!session?.user) {
      setSelectedPlan(plan);
      setIsAuthOpen(true);
      return;
    }
    if (onSelectPlan) {
      onSelectPlan(plan);
    } else {
      alert(`${plan.name} selected. Redirecting to payment gateway...`);
    }
  };

  return (
    <section id="pricing" className="py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Simple & Affordable Pricing
            </h2>
          </div>
          <Link
            href="#pricing"
            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <span>All Plans</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl p-8 transition-all flex flex-col justify-between ${
                plan.isPopular
                  ? 'border-2 border-blue-600 shadow-2xl shadow-blue-500/15 scale-102 z-10'
                  : 'border border-slate-200/90 shadow-md hover:shadow-xl'
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-extrabold rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{plan.badgeText}</span>
                </div>
              )}

              <div>
                {/* Plan Title & Price */}
                <h3 className="text-base font-bold text-slate-800 mb-4">{plan.name}</h3>
                
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">{plan.period}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleChoosePlan(plan)}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs transition shadow-xs ${
                  plan.isPopular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
                }`}
              >
                Get Started Now
              </button>
            </div>
          ))}
        </div>

      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialMode="signup" />
    </section>
  );
}
