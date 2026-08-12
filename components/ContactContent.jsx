'use client';

import { useState } from 'react';
import { Phone, Send, Download, RefreshCw, Infinity, Headphones, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    message: '',
  });

  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      return;
    }

    setStatus('submitting');

    // Simulate API request delay
    setTimeout(() => {
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        message: '',
      });
    }, 1500);
  };

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Contact Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            যোগাযোগ করুন
          </h1>
          <p className="text-slate-500 text-sm md:text-base">
            যেকোনো তথ্য, অভিযোগ বা টেকনিক্যাল সাপোর্টের জন্য নিচে দেওয়া মাধ্যমগুলোতে আমাদের সাথে যোগাযোগ করুন।
          </p>

          {/* Social Icons with brand colors on hover */}
          <div className="flex justify-center items-center gap-4 mt-6">
            {/* WhatsApp */}
            <a
              href="https://wa.me/8801793679254"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl bg-white border border-slate-100 shadow-xs flex items-center justify-center text-slate-800 hover:text-white hover:bg-[#25D366] hover:border-[#25D366] hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              title="WhatsApp"
            >
              <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.42 13.43c-.22-.11-1.3-.64-1.5-.71-.2-.07-.35-.11-.5.11-.15.22-.58.73-.71.86-.13.13-.26.15-.48.04a6.11 6.11 0 0 1-1.79-1.1c-.43-.38-.72-.85-.81-1.07-.09-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.06-.11-.5-1.2-.68-1.65-.18-.43-.37-.37-.5-.37h-.43c-.15 0-.39.06-.59.28-.2.22-.77.75-.77 1.83 0 1.08.79 2.12.9 2.27.11.15 1.55 2.37 3.76 3.32.53.23.94.36 1.26.47.53.17 1.02.14 1.4.09.43-.06 1.3-.53 1.49-1.05.19-.52.19-.97.13-1.07-.06-.1-.22-.15-.44-.26z" strokeWidth="1.8" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com/your-username"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl bg-white border border-slate-100 shadow-xs flex items-center justify-center text-slate-800 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300"
              title="Facebook"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* Email (mailto) */}
            <a
              href="mailto:info@bengal-it.com"
              className="w-11 h-11 rounded-xl bg-white border border-slate-100 shadow-xs flex items-center justify-center text-slate-800 hover:text-white hover:bg-[#EA4335] hover:border-[#EA4335] hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
              title="Email"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Contact Layout Grid (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-20 max-w-5xl mx-auto">

          {/* Left Card: Call Support */}
          <div className="bg-white border border-blue-300 rounded-lg p-8 md:p-12 flex flex-col justify-center items-center text-center shadow-xs hover:shadow-md transition-shadow">
            <div className="relative mb-6">
              {/* Pulse animation rings */}
              <div className="absolute inset-0 bg-blue-500/10 rounded-full scale-150 animate-ping duration-1000"></div>
              <div className="absolute inset-0 bg-blue-500/5 rounded-full scale-200 animate-pulse"></div>

              <div className="relative w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-xs">
                <Phone className="w-8 h-8 stroke-[2]" />
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-800 mb-1">
              সরাসরি কল করুন
            </h2>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-8">
              ২৪/৭ কাস্টমার সাপোর্ট
            </p>

            <a
              href="tel:+8801793679254"
              className="group flex items-center gap-3 py-3.5 px-8 bg-blue-50 hover:bg-blue-600 border border-blue-100 hover:border-blue-600 rounded-2xl text-blue-600 hover:text-white font-extrabold text-base md:text-lg transition-all duration-300 shadow-xs hover:shadow-lg hover:shadow-blue-600/20 active:scale-98"
            >
              {/* Inline WhatsApp icon */}
              <svg className="w-5 h-5 fill-current text-[#25D366] group-hover:text-white transition-colors" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.019-5.117-2.875-6.977C16.504 1.882 14.032.86 11.402.86c-5.437 0-9.865 4.42-9.869 9.866-.001 1.748.47 3.456 1.365 4.975L1.879 22.14l6.768-1.77zM17.89 15.3c-.31-.155-1.84-.908-2.128-1.012-.289-.104-.499-.155-.709.155-.21.31-.81.103-1.017-.156s-.414-.415-.788-.75c-.291-.26-.487-.58-.544-.677-.057-.097-.006-.15.043-.198.043-.044.097-.113.146-.17.049-.057.065-.097.097-.162.032-.065.016-.122-.008-.172-.024-.05-2.128-5.127-2.183-5.26-.057-.13-.113-.115-.156-.115h-.499c-.162 0-.427.06-.65.31-.223.25-.85.83-.85 2.025 0 1.196.87 2.35 1.017 2.535.15.185 1.71 2.61 4.14 3.655.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.15-.53-.305z" />
              </svg>
              <span>+880 1793-679254</span>
            </a>
          </div>

          {/* Right Card: Message Form */}
          <div className="bg-white border border-blue-300 rounded-lg p-8 md:p-10 shadow-xs hover:shadow-md transition-shadow">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6 pb-3 border-b border-slate-100 text-center lg:text-left">
              Quick Contact
            </h2>

            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mb-4 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">মেসেজটি সফলভাবে পাঠানো হয়েছে!</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  আপনার মেসেজের জন্য ধন্যবাদ। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  আরেকটি মেসেজ পাঠান
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 border-blue-500">

                {status === 'error' && (
                  <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>অনুগ্রহ করে নাম, ইমেল এবং বার্তার ক্ষেত্রগুলো পূরণ করুন।</span>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="আপনার নাম লিখুন"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 text-slate-800 bg-slate-50/30 text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="আপনার ইমেইল এড্রেস লিখুন"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 text-slate-800 bg-slate-50/30 text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    Whatsapp Number
                  </label>
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="আপনার হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 text-slate-800 bg-slate-50/30 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="আপনার বার্তাটি এখানে লিখুন..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 text-slate-800 bg-slate-50/30 text-sm resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm hover:-translate-y-[1px] active:translate-y-0 cursor-pointer"
                >
                  {status === 'submitting' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>মেসেজ পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Features Showcase Banner */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-xs max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-2 group">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Download className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-800 mb-1">
                Instant Download Access
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Access immediately after ordering!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-2 group">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-800 mb-1">
                Regular Updates
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Get new official updates!
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-2 group">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Infinity className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-800 mb-1">
                Unlimited Domain Use
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                You can use it as you wish.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center p-2 group">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Headphones className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-800 mb-1">
                24/7 Customer Support
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                +880 1793-679254
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
