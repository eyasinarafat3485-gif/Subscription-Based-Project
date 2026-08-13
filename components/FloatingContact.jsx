'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingContact() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isHoveredMain, setIsHoveredMain] = useState(false);
  const [isHoveredCall, setIsHoveredCall] = useState(false);
  const [isHoveredWhatsapp, setIsHoveredWhatsapp] = useState(false);

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Popover Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col items-end gap-3 mb-3"
          >
            {/* 1. Call Item */}
            <div className="relative flex items-center">
              {/* Custom Tooltip on Call Hover */}
              <AnimatePresence>
                {isHoveredCall && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-lg select-none pointer-events-none"
                  >
                    Developers Club Team
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={() => {
                  window.location.href = "tel:+8801793679254";
                }}
                onMouseEnter={() => setIsHoveredCall(true)}
                onMouseLeave={() => setIsHoveredCall(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-100 hover:shadow-xl transition-all cursor-pointer"
              >
                <span className="text-slate-800 font-bold text-sm pl-1 select-none">
                  Call
                </span>
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200 shadow-xs">
                  <Phone className="w-4 h-4 stroke-[2.5]" />
                </div>
              </motion.button>
            </div>

            {/* 2. WhatsApp Item */}
            <div className="relative flex items-center">
              {/* Custom Tooltip on WhatsApp Hover */}
              <AnimatePresence>
                {isHoveredWhatsapp && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-lg select-none pointer-events-none"
                  >
                    Developers Club Team
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={() => {
                  window.open("https://wa.me/8801793679254?text=Hello%20Developers%20Club,%20I%20would%20like%20to%20inquire%20about%20your%20services.", "_blank", "noopener,noreferrer");
                }}
                onMouseEnter={() => setIsHoveredWhatsapp(true)}
                onMouseLeave={() => setIsHoveredWhatsapp(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-100 hover:shadow-xl transition-all cursor-pointer"
              >
                <span className="text-slate-800 font-bold text-sm pl-1 select-none">
                  WhatsApp
                </span>
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors duration-200 shadow-xs">
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.42 13.43c-.22-.11-1.3-.64-1.5-.71-.2-.07-.35-.11-.5.11-.15.22-.58.73-.71.86-.13.13-.26.15-.48.04a6.11 6.11 0 0 1-1.79-1.1c-.43-.38-.72-.85-.81-1.07-.09-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.06-.11-.5-1.2-.68-1.65-.18-.43-.37-.37-.5-.37h-.43c-.15 0-.39.06-.59.28-.2.22-.77.75-.77 1.83 0 1.08.79 2.12.9 2.27.11.15 1.55 2.37 3.76 3.32.53.23.94.36 1.26.47.53.17 1.02.14 1.4.09.43-.06 1.3-.53 1.49-1.05.19-.52.19-.97.13-1.07-.06-.1-.22-.15-.44-.26z" strokeWidth="1.8" />
                  </svg>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button */}
      <div className="relative flex items-center">
        {/* Tooltip on Default Icon Hover */}
        <AnimatePresence>
          {!isOpen && isHoveredMain && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-full mr-3 px-3.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-lg select-none pointer-events-none"
            >
              Need to help?
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHoveredMain(true)}
          onMouseLeave={() => setIsHoveredMain(false)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/35 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Toggle Quick Contact"
        >
          {/* Online Indicator Green Dot */}
          {!isOpen && (
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs animate-pulse"></span>
          )}

          {/* Icon Toggle */}
          {isOpen ? (
            <X className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <MessageSquare className="w-6 h-6 stroke-[2]" />
          )}
        </motion.button>
      </div>

    </div>
  );
}
