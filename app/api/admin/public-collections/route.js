import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    // Fetch all users with their collections
    const users = await db.collection('user').find({}).toArray();

    let allDownloads = [];

    users.forEach((user) => {
      const userCollections = user.collections || user.downloadHistory || [];
      userCollections.forEach((item, idx) => {
        allDownloads.push({
          _id: item._id || `${user._id}_${idx}`,
          productId: item.productId || null,
          productTitle: item.title || item.productTitle || 'WordPress Resource',
          slug: item.slug || '',
          category: item.category || 'Plugin',
          version: item.version || 'Latest',
          image: item.image || '',
          downloadUrl: item.downloadUrl || '',
          downloadedAt: item.downloadedAt || user.createdAt || new Date(),
          status: 'Completed',
          userId: user._id,
          userName: user.name || 'Anonymous User',
          userEmail: user.email || 'user@developersclub.com',
          userImage: user.image || '',
        });
      });
    });

    // Filter by search query if provided
    if (search) {
      allDownloads = allDownloads.filter(
        (item) =>
          item.productTitle.toLowerCase().includes(search) ||
          item.category.toLowerCase().includes(search) ||
          item.userName.toLowerCase().includes(search) ||
          item.userEmail.toLowerCase().includes(search)
      );
    }

    // Sort by downloadedAt descending (newest downloads first)
    allDownloads.sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));

    const totalItems = allDownloads.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const startIndex = (page - 1) * limit;
    const paginatedItems = allDownloads.slice(startIndex, startIndex + limit);

    // Calculate stats
    const uniqueProductsCount = new Set(allDownloads.map((i) => i.productTitle)).size;
    const activeUsersCount = new Set(allDownloads.map((i) => i.userEmail)).size;

    return NextResponse.json({
      success: true,
      collections: paginatedItems,
      page,
      limit,
      totalItems,
      totalPages,
      stats: {
        totalDownloads: allDownloads.length,
        uniqueProducts: uniqueProductsCount,
        activeUsers: activeUsersCount,
      },
    });
  } catch (error) {
    console.error('GET /api/admin/public-collections error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
