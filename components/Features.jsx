'use client';

import { BookOpen, RefreshCw, ShieldCheck, Headphones, Zap, DollarSign } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Comprehensive Docs',
    desc: 'Easy and detailed step-by-step guides and product reviews.',
  },
  {
    icon: Headphones,
    title: 'Priority Support',
    desc: '24/7 fast support response to resolve any queries.',
  },
  {
    icon: RefreshCw,
    title: 'Regular Updates',
    desc: 'Immediate and constant updates for plugins and themes.',
  },
  {
    icon: Zap,
    title: 'One-Click Downloads',
    desc: 'Smooth and instant direct download links.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe & Clean',
    desc: '100% virus-free, secure, and malware-scanned.',
  },
  {
    icon: DollarSign,
    title: 'Affordable Price',
    desc: 'Get access to all premium products under a single budget subscription.',
  },
];

export default function Features() {
  return (
    <section className="py-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Features Matrix */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Why Developers Club <br />
                <span className="text-blue-600">is Your Best Choice?</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">{feat.title}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Graphic Banner Window */}
          <div className="lg:col-span-5 relative">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
              {/* Background decorative circles */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-400/20 rounded-full blur-xl" />

              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/20">
                <ShieldCheck className="w-12 h-12 text-white stroke-[1.75]" />
              </div>

              <h3 className="text-2xl font-bold mb-2">100% Guaranteed Safe</h3>
              <p className="text-xs text-blue-100 max-w-xs leading-relaxed">
                All files are original clean zip files, provided without any malicious code or virus.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
