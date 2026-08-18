import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { email, otp } = await req.json();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanOtp = otp?.trim();

    if (!cleanEmail || !cleanOtp) {
      return NextResponse.json({ success: false, error: 'Email and 6-digit OTP code are required.' }, { status: 400 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const otpDoc = await db.collection('email_otps').findOne({
      email: cleanEmail,
      otp: cleanOtp,
    });

    if (!otpDoc) {
      return NextResponse.json({ success: false, error: 'Incorrect verification code. Please check your email and try again.' }, { status: 400 });
    }

    if (new Date(otpDoc.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: 'Verification code has expired. Please click resend code.' }, { status: 400 });
    }

    // Delete used OTP
    await db.collection('email_otps').deleteOne({ _id: otpDoc._id });

    return NextResponse.json({
      success: true,
      message: 'Email address verified successfully!',
    });
  } catch (error) {
    console.error('POST /api/auth/verify-otp error:', error);
    return NextResponse.json({ success: false, error: 'Server error verifying OTP. Please try again.' }, { status: 500 });
  }
}
