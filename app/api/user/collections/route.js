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

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized: Please login first' }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase().trim();

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const userDoc = await db.collection('user').findOne({ email: userEmail });
    const userId = userDoc?._id;

    // Query STRICTLY from 'orders' collection matching user's email or userId
    const queryConditions = [
      { 'customer.email': userEmail },
      { billingEmail: userEmail },
    ];
    if (userId) {
      queryConditions.push({ userId: userId });
    }

    const userOrders = await db.collection('orders').find({
      $or: queryConditions,
    }).toArray();

    // Map orders into collection items format for My Collections page
    const collections = userOrders
      .filter((ord) => ord.type === 'product' || ord.type === 'membership_download' || ord.productId)
      .map((ord) => {
        return {
          _id: ord._id.toString(),
          orderId: ord.orderId,
          productId: ord.productId || null,
          title: ord.productTitle || ord.title || 'WordPress Resource',
          productTitle: ord.productTitle || ord.title || 'WordPress Resource',
          slug: ord.productSlug || '',
          category: ord.category || 'Plugin',
          version: ord.version || 'Latest',
          image: ord.productImage || ord.image || '',
          downloadUrl: ord.downloadUrl || '',
          downloadedAt: ord.createdAt || new Date(),
          price: ord.price || 0,
          type: ord.type || 'product',
          isVisitor: Boolean(ord.isVisitor),
        };
      });

    // Sort collections by downloadedAt / createdAt descending (newest first)
    collections.sort((a, b) => {
      const dateA = new Date(a.downloadedAt || a.createdAt || 0);
      const dateB = new Date(b.downloadedAt || b.createdAt || 0);
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      collections,
    });
  } catch (error) {
    console.error('GET User Collections Error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
