import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import connectToDatabase from '@/lib/db';

// Helper to generate a random 5-character string
function generateRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GUEST-${result}`;
}

export async function GET(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস।' }, { status: 401 });
    }

    await connectToDatabase();
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    // Fetch all coupons sorted by creation date descending
    const coupons = await db.collection('coupons')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'সার্ভার ত্রুটি।' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস।' }, { status: 401 });
    }

    await connectToDatabase();
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    // Generate a unique code
    let code = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = generateRandomCode();
      const existing = await db.collection('coupons').findOne({ code });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    const newCoupon = {
      code,
      isUsed: false,
      usedBy: null,
      usedAt: null,
      createdAt: new Date(),
    };

    await db.collection('coupons').insertOne(newCoupon);

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error) {
    console.error('Error generating coupon:', error);
    return NextResponse.json({ error: 'সার্ভার ত্রুটি।' }, { status: 500 });
  }
}
