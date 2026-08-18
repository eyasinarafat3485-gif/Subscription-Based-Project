import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const offer = searchParams.get('offer');
    const popular = searchParams.get('popular');
    const search = searchParams.get('search');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const query = {};

    if (category && category !== 'All' && category !== 'all') {
      const lowerCat = category.toLowerCase().trim();

      if (lowerCat === 'offer') {
        query.$or = [{ isOffer: true }, { category: /offer|bundle/i }];
      } else if (lowerCat === 'plugins' || lowerCat === 'plugin') {
        query.category = { $in: ['Plugin', 'plugin', 'Plugins', 'plugins'] };
      } else if (lowerCat === 'themes' || lowerCat === 'theme') {
        query.category = { $in: ['Theme', 'theme', 'Themes', 'themes', 'GPL Theme'] };
      } else if (lowerCat === 'woocommerce') {
        query.$or = [
          { category: /woocommerce/i },
          { title: /woocommerce|shop|cart|checkout/i },
        ];
      } else if (lowerCat === 'security') {
        query.$or = [
          { category: /security|backup/i },
          { title: /security|wordfence|updraft|backup|defender|malware/i },
        ];
      } else if (lowerCat === 'performance') {
        query.$or = [
          { category: /performance|speed|cache/i },
          { title: /wp rocket|cache|speed|litespeed|perfmatters|rocket/i },
        ];
      } else if (lowerCat === 'multipurpose') {
        query.$or = [
          { category: /theme/i },
          { title: /astra|divi|avada|multipurpose|elementor/i },
        ];
      } else if (lowerCat === 'blog') {
        query.$or = [
          { category: /theme/i },
          { title: /blog|newspaper|magazine/i },
        ];
      } else if (lowerCat === 'business') {
        query.$or = [
          { category: /theme|plugin/i },
          { title: /business|agency|corporate/i },
        ];
      } else if (lowerCat === 'seo') {
        query.$or = [
          { category: /seo/i },
          { title: /seo|rank math|yoast|schema|indexer/i },
        ];
      } else if (lowerCat.includes('builder') || lowerCat.includes('page')) {
        query.$or = [
          { category: /builder/i },
          { title: /elementor|divi|beaver|builder|addon|kit/i },
        ];
      } else {
        query.category = new RegExp(`^${category.trim()}$`, 'i');
      }
    }

    if (offer === 'true') {
      query.isOffer = true;
    }

    if (popular === 'true') {
      query.isPopular = true;
    }

    // Ultimate Tokenized Title Relevance Scoring Function
    const getRelevanceScore = (titleStr, searchStr) => {
      if (!titleStr || !searchStr) return 0;
      const t = titleStr.toLowerCase().trim();
      const s = searchStr.toLowerCase().trim();

      // 1. Exact Full Title Match
      if (t === s) return 1000;

      // 2. Title Starts With Search String
      if (t.startsWith(s)) return 800;

      // 3. Exact Search String Contained Within Title
      if (t.includes(s)) return 600;

      // 4. Tokenized Multi-Word Overlap Match
      const searchTokens = s.split(/\s+/).filter(Boolean);
      if (searchTokens.length === 0) return 0;

      let tokenMatches = 0;
      let wordStartMatches = 0;

      searchTokens.forEach((token) => {
        if (t.includes(token)) {
          tokenMatches++;
          if (t.startsWith(token) || t.includes(` ${token}`)) {
            wordStartMatches++;
          }
        }
      });

      const matchRatio = tokenMatches / searchTokens.length;

      if (matchRatio === 1) {
        return 400 + wordStartMatches * 20;
      }

      return matchRatio * 200 + wordStartMatches * 10;
    };

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      const searchTokens = cleanSearch.split(/\s+/).filter(Boolean);
      
      const titleOrConditions = [
        { title: new RegExp(cleanSearch.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i') }
      ];

      searchTokens.forEach((token) => {
        if (token.length > 1) {
          titleOrConditions.push({ title: new RegExp(token.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i') });
        }
      });

      query.$or = titleOrConditions;
    }

    if (pageParam && limitParam) {
      const page = parseInt(pageParam, 10) || 1;
      const limit = parseInt(limitParam, 10) || 8;
      const skip = (page - 1) * limit;

      let rawProducts = await db.collection('products')
        .find(query)
        .sort({ createdAt: -1, _id: -1 })
        .toArray();

      // If search query is active, sort strictly by Title Relevance Score (highest match first)
      if (search && search.trim()) {
        const cleanSearch = search.trim();
        rawProducts.sort((a, b) => {
          const scoreA = getRelevanceScore(a.title, cleanSearch);
          const scoreB = getRelevanceScore(b.title, cleanSearch);
          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
      }

      const totalProducts = rawProducts.length;

      const paginatedRaw = rawProducts.slice(skip, skip + limit);

      const products = paginatedRaw.map((p) => {
        const numPrice = typeof p.price === 'number' ? p.price : (typeof p.salePrice === 'number' ? p.salePrice : (Number(p.price) || Number(p.salePrice) || 299));
        const numRegularPrice = typeof p.regularPrice === 'number' ? p.regularPrice : (Number(p.regularPrice) || numPrice * 2);
        return {
          ...p,
          price: numPrice,
          salePrice: numPrice,
          regularPrice: numRegularPrice,
        };
      });

      const totalPages = Math.max(1, Math.ceil(totalProducts / limit));

      return NextResponse.json(
        {
          success: true,
          products,
          totalProducts,
          page,
          totalPages,
          limit,
        },
        {
          headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
          },
        }
      );
    }

    let rawProducts = await db.collection('products')
      .find(query)
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      rawProducts.sort((a, b) => {
        const scoreA = getRelevanceScore(a.title, cleanSearch);
        const scoreB = getRelevanceScore(b.title, cleanSearch);
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
    }

    const products = rawProducts.map((p) => {
      const numPrice = typeof p.price === 'number' ? p.price : (typeof p.salePrice === 'number' ? p.salePrice : (Number(p.price) || Number(p.salePrice) || 299));
      const numRegularPrice = typeof p.regularPrice === 'number' ? p.regularPrice : (Number(p.regularPrice) || numPrice * 2);
      return {
        ...p,
        price: numPrice,
        salePrice: numPrice,
        regularPrice: numRegularPrice,
      };
    });

    return NextResponse.json(
      { success: true, count: products.length, products },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Please login first!' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      category,
      version,
      price,
      regularPrice,
      image,
      downloadUrl,
      demoUrl,
      description,
      features,
      bundleItems,
      isOffer,
      isPopular,
      offerEndsAt,
    } = body;

    if (!title || !downloadUrl) {
      return NextResponse.json({ error: 'Product title and ZIP file link are required!' }, { status: 400 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = 'product-' + Date.now();

    let slug = baseSlug;
    let counter = 1;
    while (await db.collection('products').findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const parsedPrice = isNaN(Number(price)) ? 299 : Number(price);
    const parsedRegularPrice = isNaN(Number(regularPrice)) ? 598 : Number(regularPrice);

    const newProduct = {
      title: title.trim(),
      slug,
      category: category || 'Plugin',
      version: version || 'v1.0.0',
      price: parsedPrice,
      salePrice: parsedPrice,
      regularPrice: parsedRegularPrice,
      image: image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
      downloadUrl: downloadUrl.trim(),
      demoUrl: demoUrl ? demoUrl.trim() : '',
      description: description || '',
      features: Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').filter(Boolean) : []),
      bundleItems: Array.isArray(bundleItems) ? bundleItems : [],
      isOffer: Boolean(isOffer),
      isPopular: Boolean(isPopular),
      offerEndsAt: offerEndsAt ? new Date(offerEndsAt).toISOString() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('products').insertOne(newProduct);

    return NextResponse.json({
      success: true,
      message: `"${title}" successfully added to database!`,
      productId: result.insertedId,
      product: { ...newProduct, _id: result.insertedId },
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
