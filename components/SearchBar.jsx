'use client';

import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ query, category });
    }
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    if (onSearch) {
      onSearch({ query: tag, category });
    }
  };

  return (
    <section className="py-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#07132B] rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          
          {/* Header Title inside Box */}
          <div className="mb-5 text-left">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Find Your Required Resource
            </h2>
          </div>

          {/* Search Form Controls */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            
            {/* Text Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search plugins, themes, templates..."
                className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
            </div>

            {/* Category Select Dropdown */}
            <div className="relative md:w-56">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none px-4 py-3.5 bg-white text-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="plugin">Plugins</option>
                <option value="theme">Themes</option>
                <option value="template">Templates</option>
                <option value="resource">Resources</option>
                <option value="documentation">Documentation (Docs)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="py-3.5 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <span>Search</span>
            </button>
          </form>

          {/* Popular Tag Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Popular:</span>
            {['Elementor Pro', 'WP Rocket', 'Rank Math', 'WooCommerce', 'Astra', 'Flatsome'].map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-md text-slate-200 transition text-[11px]"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
