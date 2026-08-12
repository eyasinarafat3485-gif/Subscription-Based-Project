import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export async function POST(req) {
  try {
    const { coupon, email } = await req.json();

    if (!coupon || !email) {
      return NextResponse.json(
        { error: 'কুপন কোড এবং ইমেইল প্রদান করুন।' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Get the raw DB instance from mongoose
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    // Find the coupon in 'coupons' collection
    const couponDoc = await db.collection('coupons').findOne({ 
      code: coupon.trim().toUpperCase() 
    });

    if (!couponDoc) {
      return NextResponse.json(
        { error: 'ভ্যালিড VIP কুপন কোড প্রদান করুন!' },
        { status: 400 }
      );
    }

    if (couponDoc.isUsed) {
      return NextResponse.json(
        { error: 'এই কুপন কোডটি ইতিমধ্যে ব্যবহার করা হয়েছে!' },
        { status: 400 }
      );
    }

    // Check expiration date if it exists
    if (couponDoc.expiresAt && new Date(couponDoc.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'এই কুপন কোডটির মেয়াদ শেষ হয়ে গেছে!' },
        { status: 400 }
      );
    }

    // Mark coupon as used in database
    await db.collection('coupons').updateOne(
      { _id: couponDoc._id },
      { 
        $set: { 
          isUsed: true, 
          usedBy: email.toLowerCase(),
          usedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'সার্ভার ত্রুটি দেখা দিয়েছে।' },
      { status: 500 }
    );
  }
}
