import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export const dynamic = 'force-dynamic';

const initialProducts = [
  {
    title: 'Professional WordPress Bundle',
    slug: 'professional-wordpress-bundle',
    category: 'Offer',
    version: 'v4.2.1',
    price: 199,
    regularPrice: 5382,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1SAMPLE_BUNDLE',
    demoUrl: 'https://developersclub.com/bundle-demo',
    description: 'Super bundle mega pack of 28 premium WordPress themes & plugins. 1 year free updates & 24/7 priority customer support.',
    features: [
      '1 Year FREE Access & Updates',
      '24/7 Priority Customer Support',
      '100% Virus & Malware Free',
      'Unlimited Website Usage',
      'All Product Latest Version',
      'Instant Download',
      'License GPL'
    ],
    bundleItems: [
      { name: 'Elementor Pro', version: 'v4.2.1' },
      { name: 'WoodMart Theme', version: 'v8.5.7' },
      { name: 'CartFlows Pro', version: 'v3.1.2' },
      { name: 'Rank Math SEO Pro', version: 'v3.0.118' },
      { name: 'Astra Pro Addon', version: 'v4.13.7' },
      { name: 'PixelYourSite Pro', version: 'v12.6.2' },
      { name: 'Martfury Theme', version: 'v3.4.3' },
      { name: 'WP Rocket Premium', version: 'v3.16.2' }
    ],
    isOffer: true,
    isPopular: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Elementor Pro',
    slug: 'elementor-pro',
    category: 'Page Builders',
    version: 'v4.2.1',
    price: 299,
    regularPrice: 598,
    image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=800&auto=format&fit=crop',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1SAMPLE_ELEMENTOR',
    demoUrl: 'https://elementor.com',
    description: "The world's number one WordPress live page builder plugin pro edition.",
    features: ['Theme Builder', 'WooCommerce Builder', 'Popup Builder', 'Motion Effects'],
    isOffer: false,
    isPopular: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Cartflows pro',
    slug: 'cartflows-pro',
    category: 'Plugins',
    version: 'v3.1.2',
    price: 299,
    regularPrice: 598,
    image: 'https://images.unsplash.com/photo-1556742049-0a67e56a4b12?q=80&w=800&auto=format&fit=crop',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1SAMPLE_CARTFLOWS',
    demoUrl: 'https://cartflows.com',
    description: 'WooCommerce sales funnel builder plugin. Double your online sales.',
    features: ['One Click Upsells', 'Checkout Customizer', 'Order Bumps', 'A/B Split Testing'],
    isOffer: false,
    isPopular: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'PixelYourSite Pro',
    slug: 'pixelyoursite-pro',
    category: 'Plugins',
    version: 'v12.6.2',
    price: 299,
    regularPrice: 598,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1SAMPLE_PIXELYOURSITE',
    demoUrl: 'https://pixelyoursite.com',
    description: 'Facebook Pixel, Google Analytics 4, and Conversion API tracking plugin.',
    features: ['Facebook Pixel', 'Google Analytics 4', 'Conversion API', 'WooCommerce Tracking'],
    isOffer: false,
    isPopular: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Rank Math SEO Pro',
    slug: 'rank-math-seo-pro',
    category: 'SEO',
    version: 'v3.0.118',
    price: 299,
    regularPrice: 598,
    image: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?q=80&w=800&auto=format&fit=crop',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1SAMPLE_RANKMATH',
    demoUrl: 'https://rankmath.com',
    description: 'Best SEO plugin for search engine optimization (SEO) and schema ranking.',
    features: ['Content AI', 'Schema Generator', 'Keyword Rank Tracker', 'WooCommerce SEO'],
    isOffer: false,
    isPopular: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'WoodMart Theme',
    slug: 'woodmart-theme',
    category: 'Themes',
    version: 'v8.5.7',
    price: 299,
    regularPrice: 598,
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1SAMPLE_WOODMART',
    demoUrl: 'https://woodmart.xtemos.com',
    description: "The world's fastest premium professional theme for eCommerce websites.",
    features: ['80+ Prebuilt Demos', 'Header Builder', 'AJAX Filters', 'Mobile Optimized'],
    isOffer: false,
    isPopular: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Astra Pro – Theme Addon',
    slug: 'astra-pro-theme-addon',
    category: 'Themes',
    version: 'v4.13.7',
    price: 299,
    regularPrice: 598,
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1SAMPLE_ASTRA',
    demoUrl: 'https://wpastra.com',
    description: "Pro edition addon of the world's most popular multipurpose WordPress theme.",
    features: ['Sticky Header', 'Mega Menu', 'Custom Layouts', 'White Label'],
    isOffer: false,
    isPopular: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Premium Starter Template – Plugin',
    slug: 'premium-starter-template-plugin',
    category: 'Page Builders',
    version: 'v4.6.2',
    price: 299,
    regularPrice: 598,
    image: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?q=80&w=800&auto=format&fit=crop',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1SAMPLE_STARTER',
    demoUrl: 'https://startertemplates.com',
    description: 'Plugin to import 300+ ready-made website templates in 1 click.',
    features: ['300+ Ready Websites', 'Elementor Templates', 'Block Templates', '1 Click Import'],
    isOffer: false,
    isPopular: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Martfury Theme',
    slug: 'martfury-theme',
    category: 'Themes',
    version: 'v3.4.3',
    price: 299,
    regularPrice: 598,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1SAMPLE_MARTFURY',
    demoUrl: 'https://martfury.botble.com',
    description: 'Best WooCommerce theme for multi-vendor marketplaces & eCommerce stores.',
    features: ['Dokan Compatible', 'WCFM Marketplace', 'Vendor Dashboard', 'Daily Deals'],
    isOffer: false,
    isPopular: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'All in One WP Migration Unlimited – Premium',
    slug: 'all-in-one-wp-migration-unlimited-premium',
    category: 'Plugins',
    version: 'v2.84',
    price: 299,
    regularPrice: 598,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1SAMPLE_WPMIGRATION',
    demoUrl: 'https://servmask.com',
    description: 'Unlimited file size extension for WordPress site backup and migration.',
    features: ['Unlimited File Size', 'Restore Backups', 'CLI Commands', 'Zero Server Limits'],
    isOffer: false,
    isPopular: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function GET() {
  try {
    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const collection = db.collection('products');
    const existingCount = await collection.countDocuments();

    if (existingCount === 0) {
      await collection.insertMany(initialProducts);
      return NextResponse.json({
        success: true,
        message: '10 sample products successfully added to the MongoDB products collection!',
        count: initialProducts.length
      });
    }

    return NextResponse.json({
      success: true,
      message: `The database already contains ${existingCount} products.`,
      count: existingCount
    });
  } catch (error) {
    console.error('Seed API Error:', error);
    return NextResponse.json({ error: error.message || 'Seed Failed' }, { status: 500 });
  }
}
