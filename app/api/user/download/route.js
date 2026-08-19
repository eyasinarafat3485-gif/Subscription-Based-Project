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
    const membership = user.membership;
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
    const todayStr = new Date().toISOString().split('T')[0];
    const lastDateStr = membership.lastDownloadDate ? new Date(membership.lastDownloadDate).toISOString().split('T')[0] : '';

    let downloadsToday = membership.downloadsToday ?? 0;
    if (lastDateStr !== todayStr) {
      downloadsToday = 0; // Reset for new day
    }

    if (downloadsToday >= dailyLimit) {
      return NextResponse.json(
        { error: `Daily download limit reached (${downloadsToday}/${dailyLimit})! Please try again tomorrow or upgrade your plan.` },
        { status: 400 }
      );
    }

    const newDownloadsToday = downloadsToday + 1;

    const collectionItem = {
      _id: new mongoose.Types.ObjectId().toString(),
      productId: productId || null,
      productTitle: productTitle || 'WordPress Resource',
      title: productTitle || 'WordPress Resource',
      slug: slug || '',
      category: category || 'Plugin',
      version: version || 'Latest',
      image: image || '',
      downloadUrl: downloadUrl || '',
      downloadedAt: new Date(),
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
        },
      }
    );

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
