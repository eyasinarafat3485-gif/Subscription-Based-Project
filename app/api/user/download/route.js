import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, productTitle, slug, category, version, image, downloadUrl } = body;

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const user = await db.collection('user').findOne({ email: session.user.email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    // Check membership status
    let membership = user.membership;

    if (user.role === 'guest') {
      const nowMs = Date.now();
      const isExpired =
        membership?.expiresAt &&
        membership.expiresAt !== 'LIFETIME' &&
        new Date(membership.expiresAt).getTime() < nowMs;
      const isInactive = membership && membership.status && membership.status !== 'active';

      if (!membership || isExpired || isInactive) {
        const oneMonthExpiresAt = new Date(nowMs + 30 * 24 * 60 * 60 * 1000).toISOString();
        membership = {
          planId: membership?.planId || 'basic',
          planTitle: membership?.planTitle || 'Basic Plan',
          planPrice: 0,
          status: 'active',
          startsAt: new Date().toISOString(),
          expiresAt: oneMonthExpiresAt,
          downloadsToday: 0,
          dailyLimit: 5,
          downloadsPerDay: 5,
          updatedAt: new Date(),
        };
        await db.collection('user').updateOne(
          { email: user.email.toLowerCase() },
          { $set: { membership: membership } }
        );
      }
    }

    const isMembershipActive = membership && (membership.status === 'active' || !membership.status);

    if (!isMembershipActive) {
      return NextResponse.json(
        { error: 'An active membership plan is required for direct downloads.' },
        { status: 403 }
      );
    }

    // Calculate daily limits
    const planId = membership.planId || 'basic';
    const dailyLimit = membership.dailyLimit || (planId === 'premium' ? 20 : planId === 'standard' ? 10 : 5);

    // Check daily download limit reset date
    const now = new Date();
    const todayLocalStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayUTCStr = now.toISOString().split('T')[0];

    const lastDownloadDate = membership.lastDownloadDate;
    let isLastDownloadToday = false;
    if (lastDownloadDate) {
      try {
        const ld = new Date(lastDownloadDate);
        if (!isNaN(ld.getTime())) {
          const ldLocal = `${ld.getFullYear()}-${String(ld.getMonth() + 1).padStart(2, '0')}-${String(ld.getDate()).padStart(2, '0')}`;
          const ldUTC = ld.toISOString().split('T')[0];
          if (ldLocal === todayLocalStr || ldUTC === todayUTCStr) {
            isLastDownloadToday = true;
          }
        }
      } catch (e) {}
    }

    let downloadsToday = isLastDownloadToday ? (membership.downloadsToday ?? 0) : 0;

    if (downloadsToday >= dailyLimit) {
      return NextResponse.json(
        { error: `Daily download limit reached (${downloadsToday}/${dailyLimit})! Please try again tomorrow or upgrade your plan.` },
        { status: 400 }
      );
    }

    const newDownloadsToday = downloadsToday + 1;

    const notifId = new mongoose.Types.ObjectId().toString();

    const collectionItem = {
      _id: notifId,
      productId: productId || null,
      productTitle: productTitle || 'WordPress Resource',
      title: productTitle || 'WordPress Resource',
      slug: slug || '',
      category: category || 'Plugin',
      version: version || 'Latest',
      image: image || '',
      downloadUrl: downloadUrl || '',
      downloadedAt: new Date(),
      isRead: false,
    };

    const downloadNotif = {
      _id: notifId,
      type: 'DOWNLOAD',
      title: 'Product Downloaded',
      message: `You successfully downloaded ${productTitle || 'a resource'} (${version || 'Latest'}).`,
      productTitle: productTitle || 'WordPress Resource',
      productId: productId || null,
      slug: slug || '',
      category: category || 'Plugin',
      version: version || 'Latest',
      image: image || '',
      downloadUrl: downloadUrl || '',
      downloadedAt: new Date(),
      isRead: false,
    };

    // Update user record in MongoDB
    await db.collection('user').updateOne(
      { email: session.user.email.toLowerCase() },
      {
        $set: {
          'membership.downloadsToday': newDownloadsToday,
          'membership.dailyLimit': dailyLimit,
          'membership.lastDownloadDate': new Date(),
        },
        $push: {
          collections: collectionItem,
          downloadHistory: collectionItem,
          downloadNotifications: downloadNotif,
        },
      }
    );

    // Also record this membership download item in the 'orders' collection
    const downloadOrderId = 'ORD-DL-' + Math.floor(100000 + Math.random() * 900000);
    const newDownloadOrder = {
      orderId: downloadOrderId,
      type: 'membership_download',
      productId: productId || null,
      productTitle: productTitle || 'WordPress Resource',
      productSlug: slug || null,
      productImage: image || null,
      price: 0,
      userId: user._id,
      isVisitor: false,
      customer: {
        name: user.name || session.user.name || 'Member User',
        email: user.email.toLowerCase(),
        phone: user.phone || 'N/A',
      },
      paymentMethod: 'membership_plan',
      senderAccount: 'Membership Plan',
      transactionId: 'MBR-' + (membership.planId || 'standard').toUpperCase(),
      status: 'completed',
      createdAt: new Date(),
    };

    await db.collection('orders').insertOne(newDownloadOrder);

    return NextResponse.json({
      success: true,
      message: 'Download confirmed successfully!',
      downloadUrl: downloadUrl || '',
      downloadsToday: newDownloadsToday,
      dailyLimit,
      item: collectionItem,
    });
  } catch (error) {
    console.error('API User Download Error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
