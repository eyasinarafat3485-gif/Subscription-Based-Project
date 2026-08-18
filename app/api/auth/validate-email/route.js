import { NextResponse } from 'next/server';
import { validateOrganicEmail } from '@/lib/email-validator';
import connectToDatabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { email } = await req.json();

    // 1. Organic Email Validation (Syntax + Disposable check + DNS MX Record lookup)
    const validation = await validateOrganicEmail(email);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    // 2. Check if Email Already Exists in Database
    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const existingUser = await db.collection('user').findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'An account with this email address already exists. Please login instead.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Email address is valid and available.' });
  } catch (error) {
    console.error('POST /api/auth/validate-email error:', error);
    return NextResponse.json({ success: false, error: 'Server validation error. Please try again.' }, { status: 500 });
  }
}
