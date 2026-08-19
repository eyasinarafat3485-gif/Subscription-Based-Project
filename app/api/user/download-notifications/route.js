import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET: Fetch user download notifications
export async function GET(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const user = await db.collection('user').findOne({ email: session.user.email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let notifications = user.downloadNotifications || [];

    // Fallback: If no explicit downloadNotifications array exists yet but user has collections, format collections as notifications
    if (notifications.length === 0 && (user.collections || user.downloadHistory)) {
      const collections = user.collections || user.downloadHistory || [];
      notifications = collections.map((item, idx) => ({
        _id: item._id || `notif_${idx}`,
        type: 'DOWNLOAD',
        title: 'Product Downloaded',
        message: `You downloaded ${item.title || item.productTitle || 'a resource'} (${item.version || 'Latest'}).`,
        productTitle: item.title || item.productTitle || 'WordPress Resource',
        productId: item.productId || null,
        slug: item.slug || '',
        category: item.category || 'Plugin',
        version: item.version || 'Latest',
        image: item.image || '',
        downloadUrl: item.downloadUrl || '',
        downloadedAt: item.downloadedAt || new Date(),
        isRead: item.isRead ?? false,
      }));
    }

    // Sort newest first
    notifications.sort((a, b) => new Date(b.downloadedAt || 0) - new Date(a.downloadedAt || 0));

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('GET Download Notifications Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// PATCH: Mark all download notifications as read for logged in user
export async function PATCH(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const user = await db.collection('user').findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedNotifs = (user.downloadNotifications || []).map((n) => ({
      ...n,
      isRead: true,
    }));

    const updatedCollections = (user.collections || []).map((c) => ({
      ...c,
      isRead: true,
    }));

    await db.collection('user').updateOne(
      { email: session.user.email.toLowerCase() },
      {
        $set: {
          downloadNotifications: updatedNotifs,
          collections: updatedCollections,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Download notifications marked as read',
    });
  } catch (error) {
    console.error('PATCH Download Notifications Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
