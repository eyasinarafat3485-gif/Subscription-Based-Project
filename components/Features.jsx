'use client';

import { BookOpen, RefreshCw, ShieldCheck, Headphones, Zap, DollarSign } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'বাংলা ডকুমেন্টেশন',
    desc: 'সহজ ও বিস্তারিত বাংলায় প্রোডাক্ট এর রিভিউ এবং গাইডলাইন।',
  },
  {
    icon: Headphones,
    title: 'প্রায়োরিটি সাপোর্ট',
    desc: 'যেকোনো সমস্যায় যেকোনো সময় ২৪/৭ দ্রুত রেসপন্স ও সাপোর্ট।',
  },
  {
    icon: RefreshCw,
    title: 'নিয়মিত আপডেট',
    desc: 'সকল প্লাগইন ও থিমের নিয়মিত ফাইল ও ভার্সন আপডেট আপডেট।',
  },
  {
    icon: Zap,
    title: 'সহজ ডাউনলোড',
    desc: 'কোনো ঝামেলা ছাড়া সুন্দর ও ফার্স্ট ১-ক্লিক ডাউনলোড প্রসেস।',
  },
  {
    icon: ShieldCheck,
    title: 'সিকিউর & সেফ',
    desc: 'মালওয়্যার ১০০% স্ক্যানকৃত এনক্রিপ্টেড এবং ১০০% ভাইরাস মুক্ত।',
  },
  {
    icon: DollarSign,
    title: 'সাশ্রয়ী মূল্য',
    desc: 'একমাত্র একটি সাশ্রয়ী সাবস্ক্রিপশনে সব প্রোডাক্টের এক্সেস।',
  },
];

export default function Features() {
  return (
    <section className="py-16 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Features Matrix */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                কেন Developers Club <br />
                <span className="text-blue-600">আপনার সেরা পছন্দ?</span>
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
                সকল ফাইল অরিজিনাল ক্লিন জিপ ফাইল, যা কোনো প্রকার ক্ষতিকারক কোড বা ভাইরাস ছাড়া প্রদান করা হয়।
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
