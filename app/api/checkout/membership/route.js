import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      isVisitor = false,
      type = 'membership',
      productId = null,
      productTitle = null,
      productSlug = null,
      productImage = null,
      price = null,
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

    // Find existing registered user doc if available
    let userDoc = await db.collection('user').findOne({ email: normalizedEmail });

    // ONLY insert/update 'user' collection IF this is NOT a visitor (i.e. logged-in registered user)
    if (!isVisitor) {
      if (!userDoc) {
        const insertResult = await db.collection('user').insertOne({
          name: billingName.trim(),
          email: normalizedEmail,
          phone: billingPhone.trim(),
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        userDoc = { _id: insertResult.insertedId, email: normalizedEmail };
      } else {
        await db.collection('user').updateOne(
          { email: normalizedEmail },
          { $set: { phone: billingPhone.trim(), updatedAt: new Date() } }
        );
      }
    }

    const userId = userDoc ? userDoc._id : null;

    // Check if this is a visitor product purchase or explicit product order
    const isProductOrder = isVisitor || type === 'product';

    if (isProductOrder) {
      const orderId = 'ORD-PRD-' + Math.floor(100000 + Math.random() * 900000);
      const finalProductPrice = Number(price || planPrice || 499);

      const newOrder = {
        orderId,
        type: 'product',
        productId: productId || null,
        productTitle: productTitle || 'WordPress Item',
        productSlug: productSlug || null,
        productImage: productImage || null,
        price: finalProductPrice,
        userId: userId,
        isVisitor: Boolean(isVisitor),
        customer: {
          name: billingName.trim(),
          email: normalizedEmail,
          phone: billingPhone.trim(),
        },
        paymentMethod,
        senderAccount: senderAccount.trim(),
        transactionId: transactionId.trim().toUpperCase(),
        couponCode: couponCode ? couponCode.trim() : null,
        status: 'completed',
        createdAt: new Date(),
      };

      await db.collection('orders').insertOne(newOrder);

      return NextResponse.json({
        success: true,
        message: 'Payment Successful! Your product order has been placed.',
        orderId,
        order: newOrder,
      });
    }

    // Otherwise: Membership Plan order for Logged-In Users
    let expiresAt = null;
    const nowMs = Date.now();

    if (planId === 'basic') {
      expiresAt = new Date(nowMs + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (planId === 'standard') {
      expiresAt = new Date(nowMs + 365 * 24 * 60 * 60 * 1000).toISOString();
    } else if (planId === 'premium') {
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
      userId: userId,
      isVisitor: false,
      customer: {
        name: billingName.trim(),
        email: normalizedEmail,
        phone: billingPhone.trim(),
      },
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
      downloadsPerDay: planId === 'premium' ? 20 : planId === 'standard' ? 10 : 5,
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
      }
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
