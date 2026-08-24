import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

const INITIAL_DEFAULT_CATEGORIES = [
  { name: 'Offer', slug: 'offer', description: 'Mega Offer — Get premium plugins, themes, and powerful digital tools', count: 0 },
  { name: 'Plugins', slug: 'plugin', description: 'WordPress functional plugins & add-ons', count: 142 },
  { name: 'Themes', slug: 'theme', description: 'Premium WordPress themes & templates', count: 86 },
  { name: 'SEO Tools', slug: 'seo', description: 'SEO optimization plugins & rank boosters', count: 24 },
  { name: 'Templates', slug: 'templates', description: 'Readymade website layout kits', count: 52 },
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET() {
  try {
    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    // 1. Clean up/Capitalize existing DB records
    await db.collection('categories').updateMany(
      { $or: [{ name: 'offer' }, { slug: 'mega offer' }] },
      { $set: { name: 'Offer', slug: 'offer' } }
    );
    await db.collection('categories').updateMany(
      { name: 'Plugin' },
      { $set: { name: 'Plugins', slug: 'plugin' } }
    );
    await db.collection('categories').updateMany(
      { name: 'Theme' },
      { $set: { name: 'Themes', slug: 'theme' } }
    );
    await db.collection('categories').updateMany(
      { name: 'SEO' },
      { $set: { name: 'SEO Tools', slug: 'seo' } }
    );

    // Delete any remaining duplicate category documents from categories collection
    const allCategories = await db.collection('categories').find({}).toArray();
    const seenNames = new Set();
    const duplicateIds = [];

    allCategories.forEach((cat) => {
      const norm = (cat.name || '').toLowerCase().trim();
      const aliasNorm = norm === 'plugin' ? 'plugins' : (norm === 'theme' ? 'themes' : (norm === 'seo' ? 'seo tools' : norm));
      if (seenNames.has(aliasNorm)) {
        duplicateIds.push(cat._id);
      } else {
        seenNames.add(aliasNorm);
      }
    });

    if (duplicateIds.length > 0) {
      await db.collection('categories').deleteMany({ _id: { $in: duplicateIds } });
    }

    // Update product categories to standard names
    await db.collection('products').updateMany({ category: 'Plugin' }, { $set: { category: 'Plugins' } });
    await db.collection('products').updateMany({ category: 'Theme' }, { $set: { category: 'Themes' } });
    await db.collection('products').updateMany({ category: 'SEO' }, { $set: { category: 'SEO Tools' } });

    // 2. Get all products from database
    const products = await db.collection('products').find({}).toArray();

    // 3. Auto-sync any distinct product category into categories table if missing
    let categories = await db.collection('categories').find({}).toArray();

    // Seed defaults if completely empty
    if (categories.length === 0) {
      const formattedInitial = INITIAL_DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await db.collection('categories').insertMany(formattedInitial);
      categories = await db.collection('categories').find({}).toArray();
    }

    const standardAliases = new Set([
      'plugin', 'plugins', 'theme', 'themes', 'seo', 'seo tools', 'template', 'templates', 'offer', 'mega offer'
    ]);

    const existingCatNamesLower = new Set(categories.map((c) => (c.name || '').toLowerCase().trim()));
    const missingCatDocs = [];

    products.forEach((p) => {
      if (p.category && typeof p.category === 'string') {
        const catName = p.category.trim();
        const catLower = catName.toLowerCase();
        if (catName && !existingCatNamesLower.has(catLower) && !standardAliases.has(catLower)) {
          existingCatNamesLower.add(catLower);
          missingCatDocs.push({
            name: catName,
            slug: slugify(catName),
            description: `${catName} category products & add-ons`,
            count: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    });

    if (missingCatDocs.length > 0) {
      await db.collection('categories').insertMany(missingCatDocs);
      categories = await db.collection('categories').find({}).toArray();
    }

    // 4. Dynamically calculate actual product count for each category
    const formattedCategories = categories.map((cat) => {
      const catNameLower = (cat.name || '').toLowerCase().trim();
      const catSlugLower = (cat.slug || '').toLowerCase().trim();

      let count = 0;
      if (catSlugLower === 'plugin' || catNameLower === 'plugins' || catNameLower === 'plugin') {
        count = products.filter((p) => /plugin|builder|addon|extension|woocommerce/i.test(p.category || '') || !p.category || p.category === 'Plugins' || p.category === 'Plugin').length;
      } else if (catSlugLower === 'theme' || catNameLower === 'themes' || catNameLower === 'theme') {
        count = products.filter((p) => /theme/i.test(p.category || '')).length;
      } else if (catSlugLower === 'seo' || catNameLower.includes('seo')) {
        count = products.filter((p) => /seo/i.test(p.category || '') || /seo/i.test(p.title || '')).length;
      } else if (catSlugLower === 'templates' || catNameLower.includes('template')) {
        count = products.filter((p) => /template|readymade|website|landing/i.test(p.category || '')).length;
      } else if (catSlugLower === 'offer' || catSlugLower === 'mega offer' || catNameLower.includes('offer')) {
        count = products.filter((p) => p.isOffer || /offer|bundle/i.test(p.category || '') || /offer|bundle/i.test(p.title || '')).length;
      } else {
        count = products.filter((p) => {
          const pCat = (p.category || '').toLowerCase().trim();
          return pCat === catNameLower || pCat === catSlugLower || (pCat && catNameLower.includes(pCat)) || (pCat && pCat.includes(catNameLower));
        }).length;
      }

      return {
        id: cat._id ? cat._id.toString() : cat.slug,
        _id: cat._id ? cat._id.toString() : cat.slug,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        count: count,
        createdAt: cat.createdAt,
      };
    });

    return NextResponse.json({ success: true, totalProducts: products.length, categories: formattedCategories }, {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' }
    });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
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
    const { name, slug, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const catName = name.trim();
    const catSlug = (slug && slug.trim()) ? slug.trim().toLowerCase() : slugify(catName);

    // Check if category with same name or slug already exists
    const existing = await db.collection('categories').findOne({
      $or: [{ slug: catSlug }, { name: new RegExp(`^${catName}$`, 'i') }]
    });

    if (existing) {
      return NextResponse.json({ error: 'Category with this name or slug already exists' }, { status: 400 });
    }

    const newCat = {
      name: catName,
      slug: catSlug,
      description: description ? description.trim() : 'Custom category',
      count: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('categories').insertOne(newCat);

    return NextResponse.json({
      success: true,
      message: 'Category added successfully!',
      category: {
        id: result.insertedId.toString(),
        _id: result.insertedId.toString(),
        ...newCat,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Please login first!' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (!id && !slug) {
      return NextResponse.json({ error: 'Category ID or Slug required for deletion' }, { status: 400 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    let deleteFilter = {};
    if (id) {
      try {
        deleteFilter = { _id: new ObjectId(id) };
      } catch (e) {
        deleteFilter = { slug: id };
      }
    } else if (slug) {
      deleteFilter = { slug };
    }

    await db.collection('categories').deleteOne(deleteFilter);

    return NextResponse.json({ success: true, message: 'Category removed successfully' });
  } catch (error) {
    console.error('DELETE /api/categories error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}
