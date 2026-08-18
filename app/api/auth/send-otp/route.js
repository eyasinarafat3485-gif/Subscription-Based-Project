import { NextResponse } from 'next/server';
import { validateOrganicEmail } from '@/lib/email-validator';
import connectToDatabase from '@/lib/db';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { email } = await req.json();
    const cleanEmail = email?.trim().toLowerCase();

    // 1. Organic Email Validation (Syntax + Disposable Check + DNS MX Record verification)
    const validation = await validateOrganicEmail(cleanEmail);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    // 2. Check if user already registered
    const existingUser = await db.collection('user').findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'An account with this email address already exists. Please login instead.' }, { status: 400 });
    }

    // 3. Generate 6-Digit Secure OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save OTP to email_otps collection (upsert)
    await db.collection('email_otps').updateOne(
      { email: cleanEmail },
      {
        $set: {
          email: cleanEmail,
          otp,
          expiresAt,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // 4. Send Email via Nodemailer
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER || 'eyasinarafat3485@gmail.com';
    const smtpPass = process.env.SMTP_PASS || '';

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: `"Developers Club" <${smtpUser || 'info@bengal-it.com'}>`,
      to: cleanEmail,
      subject: `🔐 Your Verification Code: ${otp} - Developers Club Registration`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">Developers Club</h1>
            <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9; font-weight: 500;">Bangladesh's WordPress Developer Platform</p>
          </div>
          
          <div style="padding: 32px 28px; color: #1e293b; line-height: 1.6;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; text-align: center;">Email Verification Code</h2>
            <p style="font-size: 14px; color: #475569; text-align: center; margin-bottom: 24px;">
              Use the 6-digit code below to verify your email address and complete your registration:
            </p>
            
            <div style="background: #f8fafc; border: 2px dashed #2563eb; border-radius: 16px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="display: block; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Your 6-Digit OTP Code</span>
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; color: #2563eb; letter-spacing: 8px;">${otp}</span>
            </div>
            
            <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 20px;">
              ⏱️ This code will expire in <strong>10 minutes</strong>. If you did not request this registration, please ignore this email.
            </p>
          </div>
          
          <div style="background: #f1f5f9; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            © 2026 Developers Club - Bangladesh. All rights reserved.
          </div>
        </div>
      `,
    };

    if (smtpUser && smtpPass) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[DEV MODE - SMTP NOT CONFIGURED] Verification OTP for ${cleanEmail}: ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox.`,
    });
  } catch (error) {
    console.error('POST /api/auth/send-otp error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to send OTP email. Please try again.' }, { status: 500 });
  }
}
