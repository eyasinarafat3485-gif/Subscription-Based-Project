'use client';

import { useState } from 'react';
import { Phone, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHoveredMain, setIsHoveredMain] = useState(false);
  const [isHoveredWhatsapp, setIsHoveredWhatsapp] = useState(false);

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
            <motion.button
              onClick={() => {
                window.location.href = "tel:+8801793679254";
              }}
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
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.019-5.117-2.875-6.977C16.504 1.882 14.032.86 11.402.86c-5.437 0-9.865 4.42-9.869 9.866-.001 1.748.47 3.456 1.365 4.975L1.879 22.14l6.768-1.77zM17.89 15.3c-.31-.155-1.84-.908-2.128-1.012-.289-.104-.499-.155-.709.155-.21.31-.81.103-1.017-.156s-.414-.415-.788-.75c-.291-.26-.487-.58-.544-.677-.057-.097-.006-.15.043-.198.043-.044.097-.113.146-.17.049-.057.065-.097.097-.162.032-.065.016-.122-.008-.172-.024-.05-2.128-5.127-2.183-5.26-.057-.13-.113-.115-.156-.115h-.499c-.162 0-.427.06-.65.31-.223.25-.85.83-.85 2.025 0 1.196.87 2.35 1.017 2.535.15.185 1.71 2.61 4.14 3.655.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.15-.53-.305z"/>
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
