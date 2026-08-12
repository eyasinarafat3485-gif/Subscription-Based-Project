'use client';

import { X, ExternalLink } from 'lucide-react';

export default function DemoModal({ url, onClose }) {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-5xl h-[85vh] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-700">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-800 border-b border-slate-700 text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs font-mono text-slate-300 truncate max-w-md">{url}</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
            >
              <span>নতুন ট্যাবে খুলুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Iframe View */}
        <div className="flex-1 bg-white relative">
          <iframe
            src={url}
            title="Live Demo Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

      </div>
    </div>
  );
}
