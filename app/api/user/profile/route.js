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

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const user = await db.collection('user').findOne({ email: session.user.email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const todayLocalStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayUTCStr = now.toISOString().split('T')[0];

    const userCollections = Array.isArray(user.collections)
      ? user.collections
      : (Array.isArray(user.downloadHistory) ? user.downloadHistory : []);

    const totalDownloads = userCollections.length;

    // Robust daily download count calculation
    const todayDownloadsFromCollections = userCollections.filter((item) => {
      const itemDate = item.downloadedAt || item.createdAt || item.savedAt;
      if (!itemDate) return true;
      try {
        const d = new Date(itemDate);
        if (isNaN(d.getTime())) return true;
        const itemLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const itemUTC = d.toISOString().split('T')[0];
        return itemLocal === todayLocalStr || itemUTC === todayUTCStr;
      } catch (e) {
        return true;
      }
    }).length;

    const rawMemDownloads = user.membership?.downloadsToday ?? (typeof user.downloadsToday === 'number' ? user.downloadsToday : 0);

    let currentDownloadsToday = Math.max(
      rawMemDownloads,
      todayDownloadsFromCollections,
      userCollections.length > 0 ? userCollections.length : 0
    );

    let userMembership = null;

    if (user.role === 'guest') {
      const nowMs = Date.now();
      const isExpired =
        user.membership?.expiresAt &&
        user.membership.expiresAt !== 'LIFETIME' &&
        new Date(user.membership.expiresAt).getTime() < nowMs;
      const isInactive = user.membership && user.membership.status && user.membership.status !== 'active';

      if (!user.membership || isExpired || isInactive) {
        const oneMonthExpiresAt = new Date(nowMs + 30 * 24 * 60 * 60 * 1000).toISOString();
        const autoGuestMembership = {
          planId: user.membership?.planId || 'basic',
          planTitle: user.membership?.planTitle || 'Basic Plan',
          planPrice: 0,
          status: 'active',
          startsAt: new Date().toISOString(),
          expiresAt: oneMonthExpiresAt,
          downloadsToday: currentDownloadsToday,
          dailyLimit: 5,
          downloadsPerDay: 5,
          updatedAt: new Date(),
        };

        user.membership = autoGuestMembership;
        await db.collection('user').updateOne(
          { email: user.email.toLowerCase() },
          { $set: { membership: autoGuestMembership } }
        );
      }
    }

    if (user.membership && typeof user.membership === 'object') {
      const planId = user.membership.planId || 'basic';
      const defaultDailyLimit = planId === 'premium' ? 20 : planId === 'standard' ? 10 : 5;
      const dailyLimit = user.membership.dailyLimit || defaultDailyLimit;

      const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
      const defaultExpiresAt = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const expiresAt = user.membership.expiresAt || defaultExpiresAt;

      userMembership = {
        planId: planId,
        planTitle: user.membership.planTitle || (planId === 'premium' ? 'Premium' : planId === 'standard' ? 'Standard' : 'Basic'),
        expiresAt: expiresAt,
        ...user.membership,
        status: user.membership.status || 'active',
        downloadsToday: currentDownloadsToday,
        dailyLimit: dailyLimit,
      };
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image || null,
        bio: user.bio || '',
        role: user.role || 'user',
        totalDownloads: totalDownloads,
        membership: userMembership,
      },
    });
  } catch (error) {
    console.error('GET Profile Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, image, bio } = body;

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (image !== undefined) updateFields.image = image;
    if (bio !== undefined) updateFields.bio = bio;
    updateFields.updatedAt = new Date();

    const result = await db.collection('user').updateOne(
      { email: session.user.email.toLowerCase() },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const updatedUser = await db.collection('user').findOne({ email: session.user.email.toLowerCase() });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        bio: updatedUser.bio,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('PUT Profile Error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
