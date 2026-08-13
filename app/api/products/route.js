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
      if (category === 'Offer' || category === 'offer') {
        query.isOffer = true;
      } else if (category === 'Plugins' || category === 'plugin') {
        query.category = { $in: ['Plugin', 'plugin', 'Page Builder', 'SEO'] };
      } else if (category === 'Themes' || category === 'theme') {
        query.category = { $in: ['Theme', 'theme', 'eCommerce Theme', 'GPL Theme'] };
      } else {
        query.category = new RegExp(category, 'i');
      }
    }

    if (offer === 'true') {
      query.isOffer = true;
    }

    if (popular === 'true') {
      query.isPopular = true;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
      ];
    }

    if (pageParam && limitParam) {
      const page = parseInt(pageParam, 10) || 1;
      const limit = parseInt(limitParam, 10) || 8;
      const skip = (page - 1) * limit;

      const totalProducts = await db.collection('products').countDocuments(query);
      const products = await db.collection('products')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalPages = Math.max(1, Math.ceil(totalProducts / limit));

      return NextResponse.json({
        success: true,
        products,
        totalProducts,
        page,
        totalPages,
        limit,
      });
    }

    const products = await db.collection('products')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, count: products.length, products });
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

    const newProduct = {
      title: title.trim(),
      slug,
      category: category || 'Plugin',
      version: version || 'v1.0.0',
      price: Number(price) || 299,
      regularPrice: Number(regularPrice) || 598,
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
