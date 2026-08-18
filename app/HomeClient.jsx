'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategoryGrid from '@/components/CategoryGrid';
import PluginGrid from '@/components/PluginGrid';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import Articles from '@/components/Articles';
import Footer from '@/components/Footer';

export default function HomeClient() {
  const handleDownload = (plugin) => {
    alert(`Generating ZIP download request for ${plugin.title}...`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Navbar */}
      <Header />

      <main>
        {/* 2. Hero Section */}
        <Hero />

        {/* 4. Category Grid (7 categories) */}
        <CategoryGrid />

        {/* 5. Popular Plugins Section */}
        <PluginGrid onDownloadClick={handleDownload} />

        {/* 6. Why Developers Club Features Section */}
        <Features />

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
