import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      planId = 'standard',
      planTitle = 'Standard Membership Plan',
      planPrice = 999,
      billingName,
      billingPhone,
      billingEmail,
      paymentMethod = 'nagad',
      senderAccount,
      transactionId,
      couponCode,
    } = body;

    if (!billingName || !billingPhone || !billingEmail) {
      return NextResponse.json(
        { error: 'Name, Phone, and Email address are required fields.' },
        { status: 400 }
      );
    }

    if (!senderAccount || !transactionId) {
      return NextResponse.json(
        { error: 'Sender Account Number and Transaction ID are required for verification.' },
        { status: 400 }
      );
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const normalizedEmail = billingEmail.trim().toLowerCase();

    // Calculate expiration timestamp
    let expiresAt = null;
    const nowMs = Date.now();
    
    if (planId === 'basic') {
      // 30 Days (Monthly)
      expiresAt = new Date(nowMs + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (planId === 'standard') {
      // 365 Days (Yearly)
      expiresAt = new Date(nowMs + 365 * 24 * 60 * 60 * 1000).toISOString();
    } else if (planId === 'premium') {
      // Lifetime / Unlimited
      expiresAt = 'LIFETIME';
    } else {
      expiresAt = new Date(nowMs + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    const orderId = 'ORD-MBR-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
      orderId,
      type: 'membership',
      planId,
      planTitle,
      planPrice: Number(planPrice),
      billingName: billingName.trim(),
      billingPhone: billingPhone.trim(),
      billingEmail: normalizedEmail,
      paymentMethod,
      senderAccount: senderAccount.trim(),
      transactionId: transactionId.trim().toUpperCase(),
      couponCode: couponCode ? couponCode.trim() : null,
      status: 'completed',
      startsAt: new Date().toISOString(),
      expiresAt,
      createdAt: new Date(),
    };

    await db.collection('orders').insertOne(newOrder);

    const membershipData = {
      planId,
      planTitle,
      planPrice: Number(planPrice),
      status: 'active',
      startsAt: new Date().toISOString(),
      expiresAt,
      orderId,
      downloadsPerDay: planId === 'premium' ? 20 : (planId === 'standard' ? 10 : 5),
      updatedAt: new Date(),
    };

    await db.collection('user').updateOne(
      { email: normalizedEmail },
      {
        $set: {
          name: billingName.trim(),
          phone: billingPhone.trim(),
          membership: membershipData,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Payment Successful! Your membership has been activated.',
      orderId,
      membership: membershipData,
    });
  } catch (error) {
    console.error('POST /api/checkout/membership error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process order' },
      { status: 500 }
    );
  }
}
