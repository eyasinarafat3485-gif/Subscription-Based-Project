import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import GuestRequest from '@/models/GuestRequest';

export const dynamic = 'force-dynamic';

// GET: Retrieve the logged-in user's latest guest request
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

    // Fetch user details from DB
    const user = await db.collection('user').findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find all guest requests for this user sorted by createdAt descending
    const guestReqs = await GuestRequest.find({ userEmail: user.email.toLowerCase() })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      role: user.role || 'user',
      request: guestReqs[0] || null,
      requests: guestReqs || [],
    });
  } catch (error) {
    console.error('GET /api/user/guest-request error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST: User requests Guest Access / Coupon from Admin
export async function POST(req) {
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

    if (user.role === 'guest') {
      return NextResponse.json({ error: 'You already have Guest membership!' }, { status: 400 });
    }

    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Admins already have full access.' }, { status: 400 });
    }

    // Check if there is already an active pending request
    const existingReq = await GuestRequest.findOne({
      userEmail: user.email.toLowerCase(),
      status: { $in: ['REQUESTED', 'COUPON_SENT', 'COUPON_SUBMITTED'] }
    });

    if (existingReq) {
      return NextResponse.json({
        success: true,
        message: 'You already have an active request in progress!',
        request: existingReq,
      });
    }

    // 1-Hour (3600s) Cooldown Check from last request or rejection/deletion
    const lastRequest = await GuestRequest.findOne({
      userEmail: user.email.toLowerCase()
    }).sort({ updatedAt: -1, createdAt: -1 });

    if (lastRequest) {
      const lastTimeMs = new Date(
        lastRequest.rejectedAt ||
        lastRequest.deletedAt ||
        lastRequest.updatedAt ||
        lastRequest.requestedAt ||
        lastRequest.createdAt
      ).getTime();

      const nowMs = Date.now();
      const diffMs = nowMs - lastTimeMs;
      const oneHourMs = 60 * 60 * 1000; // 3,600,000 ms

      if (diffMs < oneHourMs) {
        const remainingSeconds = Math.ceil((oneHourMs - diffMs) / 1000);
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        return NextResponse.json({
          error: `Please wait ${timeStr} until the 1-hour cooldown finishes before requesting again!`,
          cooldownRemainingSeconds: remainingSeconds,
        }, { status: 429 });
      }
    }

    // Create a new Guest Request
    const newGuestReq = await GuestRequest.create({
      userId: user._id,
      userName: user.name || 'User',
      userEmail: user.email.toLowerCase(),
      userImage: user.image || '',
      userCreatedAt: user.createdAt || new Date(),
      status: 'REQUESTED',
      requestedAt: new Date(),
      isReadByAdmin: false,
      isReadByUser: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Guest membership request submitted to Admin successfully!',
      request: newGuestReq,
    });
  } catch (error) {
    console.error('POST /api/user/guest-request error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// PUT: User submits the 1-time coupon code received from Admin
export async function PUT(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { couponCode } = body;

    if (!couponCode || typeof couponCode !== 'string' || !couponCode.trim()) {
      return NextResponse.json({ error: 'Please enter a valid coupon code!' }, { status: 400 });
    }

    const cleanCode = couponCode.trim().toUpperCase();

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const user = await db.collection('user').findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check the coupon in 'coupons' collection
    const couponDoc = await db.collection('coupons').findOne({ code: cleanCode });

    if (!couponDoc) {
      return NextResponse.json({ error: 'Invalid coupon code! Please check and try again.' }, { status: 400 });
    }

    if (couponDoc.isUsed) {
      return NextResponse.json({ error: 'This coupon code has already been used!' }, { status: 400 });
    }

    // Mark the coupon as used in MongoDB
    await db.collection('coupons').updateOne(
      { _id: couponDoc._id },
      {
        $set: {
          isUsed: true,
          usedBy: user.email.toLowerCase(),
          usedAt: new Date(),
        },
      }
    );

    // Update the GuestRequest status to 'COUPON_SUBMITTED'
    let guestReq = await GuestRequest.findOne({
      userEmail: user.email.toLowerCase(),
    }).sort({ createdAt: -1 });

    if (!guestReq) {
      guestReq = await GuestRequest.create({
        userId: user._id,
        userName: user.name || 'User',
        userEmail: user.email.toLowerCase(),
        userImage: user.image || '',
        userCreatedAt: user.createdAt || new Date(),
        status: 'COUPON_SUBMITTED',
        couponCode: cleanCode,
        requestedAt: new Date(),
        submittedAt: new Date(),
        isReadByAdmin: false,
      });
    } else {
      guestReq.status = 'COUPON_SUBMITTED';
      guestReq.couponCode = cleanCode;
      guestReq.submittedAt = new Date();
      guestReq.isReadByAdmin = false;
      await guestReq.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon code verified! Your Guest Role upgrade request is now PENDING Admin final approval.',
      request: guestReq,
    });
  } catch (error) {
    console.error('PUT /api/user/guest-request error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
