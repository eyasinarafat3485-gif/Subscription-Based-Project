'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SearchBar from '@/components/SearchBar';
import CategoryGrid from '@/components/CategoryGrid';
import PluginGrid from '@/components/PluginGrid';
import Features from '@/components/Features';
import UnlimitedBanner from '@/components/UnlimitedBanner';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import Articles from '@/components/Articles';
import Footer from '@/components/Footer';

export default function Home() {
  const handleSearch = (filter) => {
    console.log('Search filter:', filter);
  };

  const handleDownload = (plugin) => {
    alert(`Generating ZIP download request for ${plugin.title}...`);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.substring(1);
      const scrollToElement = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      };

      // Perform multi-stage scrolling to correct for layout shifts (e.g. loading images, grids)
      setTimeout(scrollToElement, 100);
      setTimeout(scrollToElement, 600);
      setTimeout(scrollToElement, 1200);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Navbar */}
      <Header />

      <main>
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Dark Navy Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* 4. Category Grid (7 categories) */}
        <CategoryGrid />

        {/* 5. Popular Plugins Section */}
        <PluginGrid onDownloadClick={handleDownload} />

        {/* 6. Why Developers Club Features Section */}
        <Features />

        {/* 7. Unlimited Membership Callout Banner */}
        <UnlimitedBanner />

        {/* 8. Pricing Section (3 Plans) */}
        <Pricing />

        {/* 9. Testimonials Section */}
        <Testimonials />

        {/* 10. Articles Section */}
        <Articles />
      </main>

      {/* 11. Footer */}
      <Footer />
    </div>
  );
}
