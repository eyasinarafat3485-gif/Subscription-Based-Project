import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import GuestRequest from '@/models/GuestRequest';
import nodemailer from 'nodemailer';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

function generateRandomGuestCoupon() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GUEST-${result}`;
}

// GET: Fetch all active and paginated guest requests for Admin
export async function GET(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const query = {};
    if (status && status !== 'all' && status !== 'PAYMENT') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { userName: new RegExp(search, 'i') },
        { userEmail: new RegExp(search, 'i') },
        { couponCode: new RegExp(search, 'i') },
      ];
    }

    const requests = await GuestRequest.find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    // Also fetch recent Payment Orders
    const orderQuery = {};
    if (search) {
      orderQuery.$or = [
        { orderId: new RegExp(search, 'i') },
        { 'customer.name': new RegExp(search, 'i') },
        { 'customer.email': new RegExp(search, 'i') },
        { billingName: new RegExp(search, 'i') },
        { billingEmail: new RegExp(search, 'i') },
        { transactionId: new RegExp(search, 'i') },
        { senderAccount: new RegExp(search, 'i') },
        { paymentMethod: new RegExp(search, 'i') },
      ];
    }

    let formattedOrders = [];
    if (!status || status === 'all' || status === 'PAYMENT') {
      const orders = await db.collection('orders')
        .find(orderQuery)
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      formattedOrders = orders.map((ord) => ({
        _id: ord._id.toString(),
        type: 'PAYMENT_ORDER',
        orderId: ord.orderId,
        userName: ord.customer?.name || ord.billingName || 'Valued Customer',
        userEmail: ord.customer?.email || ord.billingEmail || 'N/A',
        userPhone: ord.customer?.phone || ord.billingPhone || ord.senderAccount || 'N/A',
        productTitle: ord.productTitle || ord.planTitle || (ord.type === 'membership' ? 'Membership Plan' : 'Product'),
        amount: ord.price || ord.planPrice || ord.amount || 0,
        paymentMethod: (ord.paymentMethod || 'bkash').toUpperCase(),
        senderAccount: ord.senderAccount || 'N/A',
        transactionId: ord.transactionId || 'N/A',
        status: ord.status === 'completed' ? 'PAID' : 'PENDING',
        requestedAt: ord.createdAt || new Date(),
        createdAt: ord.createdAt || new Date(),
        isReadByAdmin: ord.isReadByAdmin ?? false,
      }));
    }

    const unreadGuestCount = await GuestRequest.countDocuments({
      isReadByAdmin: false,
      status: { $in: ['REQUESTED', 'COUPON_SUBMITTED'] },
    });

    const unreadOrderCount = await db.collection('orders').countDocuments({
      isReadByAdmin: false,
    });

    const unreadCount = unreadGuestCount + unreadOrderCount;

    // Merge and sort newest first
    const combined = [...requests, ...formattedOrders].sort((a, b) => {
      const timeA = new Date(a.requestedAt || a.createdAt || 0);
      const timeB = new Date(b.requestedAt || b.createdAt || 0);
      return timeB - timeA;
    });

    const totalRequests = combined.length;
    const totalPages = Math.max(1, Math.ceil(totalRequests / limit));
    const skip = (page - 1) * limit;
    const paginatedRequests = combined.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      requests: paginatedRequests,
      unreadCount,
      page,
      limit,
      totalRequests,
      totalPages,
    });
  } catch (error) {
    console.error('GET /api/admin/guest-requests error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST: Admin Actions (send-coupon, approve, reject, delete, mark-read)
export async function POST(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 401 });
    }

    const body = await req.json();
    const { action, requestId, userId, userEmail } = body;

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    if (action === 'mark-all-read') {
      await GuestRequest.updateMany({ isReadByAdmin: false }, { $set: { isReadByAdmin: true } });
      return NextResponse.json({ success: true, message: 'All marked as read' });
    }

    // Find the target request
    let requestDoc = null;
    if (requestId) {
      requestDoc = await GuestRequest.findById(requestId);
    } else if (userEmail) {
      requestDoc = await GuestRequest.findOne({ userEmail: userEmail.toLowerCase() }).sort({ createdAt: -1 });
    }

    if (!requestDoc && !userId && !userEmail) {
      return NextResponse.json({ error: 'Target request or user not found!' }, { status: 404 });
    }

    const targetEmail = requestDoc ? requestDoc.userEmail : userEmail.toLowerCase();
    const targetName = requestDoc ? requestDoc.userName : 'Valued User';

    // ACTION 1: SEND COUPON
    if (action === 'send-coupon') {
      let couponCode = '';
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        couponCode = generateRandomGuestCoupon();
        const existing = await db.collection('coupons').findOne({ code: couponCode });
        if (!existing) isUnique = true;
        attempts++;
      }

      await db.collection('coupons').insertOne({
        code: couponCode,
        isUsed: false,
        usedBy: null,
        assignedTo: targetEmail,
        createdAt: new Date(),
        type: 'guest_membership',
      });

      if (requestDoc) {
        requestDoc.status = 'COUPON_SENT';
        requestDoc.couponCode = couponCode;
        requestDoc.couponSentAt = new Date();
        requestDoc.isReadByAdmin = true;
        requestDoc.isReadByUser = false;
        await requestDoc.save();
      }

      // Dispatch Email via Nodemailer
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER || 'eyasinarafat3485@gmail.com',
            pass: process.env.SMTP_PASS || '',
          },
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const mailOptions = {
          from: `"Developers Club" <${process.env.SMTP_USER || 'info@bengal-it.com'}>`,
          to: targetEmail,
          subject: `🎁 Your Exclusive Guest Membership Coupon Code: ${couponCode}`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 32px 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Developers Club</h1>
                <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Guest Role Membership Invitation</p>
              </div>
              <div style="padding: 32px 28px; color: #1e293b; line-height: 1.6;">
                <p style="font-size: 16px; font-weight: 600; margin-top: 0;">Hello ${targetName},</p>
                <p style="font-size: 14px; color: #475569;">
                  The Admin has reviewed and approved your request for <strong>Guest Membership</strong>. Here is your exclusive, single-use VIP Coupon Code:
                </p>
                <div style="background: #f1f5f9; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                  <span style="display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Your 1-Time Coupon Code</span>
                  <span style="font-family: monospace; font-size: 26px; font-weight: 900; color: #1d4ed8; letter-spacing: 3px;">${couponCode}</span>
                </div>
                <p style="font-size: 13px; color: #475569;">
                  <strong>How to activate your Guest Role:</strong><br>
                  1. Login and go to your <a href="${appUrl}/dashboard/user/my-profile" style="color: #2563eb; font-weight: 600;">My Profile</a> page.<br>
                  2. Enter this coupon code in the <strong>Guest Role Request</strong> section.<br>
                  3. Submit the coupon to instantly activate your Guest dashboard access.
                </p>
              </div>
              <div style="background: #f8fafc; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                © 2026 Developers Club. All rights reserved.
              </div>
            </div>
          `,
        };

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          await transporter.sendMail(mailOptions);
        }
      } catch (mailErr) {
        console.error('Nodemailer error in send-coupon:', mailErr.message);
      }

      return NextResponse.json({
        success: true,
        message: `Guest coupon ${couponCode} generated and sent to ${targetEmail}!`,
        couponCode,
      });
    }

    // ACTION 2: APPROVE GUEST ROLE
    if (action === 'approve') {
      let userFilter = {};
      if (requestDoc?.userId) {
        try {
          userFilter = { _id: new ObjectId(requestDoc.userId) };
        } catch {
          userFilter = { email: targetEmail };
        }
      } else {
        userFilter = { email: targetEmail };
      }

      const oneMonthExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const guestBasicMembership = {
        planId: 'basic',
        planTitle: 'Basic Plan',
        planPrice: 0,
        status: 'active',
        startsAt: new Date().toISOString(),
        expiresAt: oneMonthExpiresAt,
        downloadsToday: 0,
        dailyLimit: 5,
        downloadsPerDay: 5,
        updatedAt: new Date(),
      };

      await db.collection('user').updateOne(userFilter, {
        $set: {
          role: 'guest',
          membership: guestBasicMembership,
          updatedAt: new Date(),
        },
      });

      if (requestDoc) {
        requestDoc.status = 'APPROVED';
        requestDoc.approvedAt = new Date();
        requestDoc.isReadByAdmin = true;
        requestDoc.isReadByUser = false;
        await requestDoc.save();
      }

      return NextResponse.json({
        success: true,
        message: `User "${targetName}" role successfully updated to GUEST!`,
      });
    }

    // ACTION 3: REJECT
    if (action === 'reject') {
      if (requestDoc) {
        requestDoc.status = 'REJECTED';
        requestDoc.rejectedAt = new Date();
        requestDoc.isReadByAdmin = true;
        requestDoc.isReadByUser = false;
        await requestDoc.save();
      }
      return NextResponse.json({
        success: true,
        message: `Guest request for "${targetName}" has been rejected.`,
      });
    }

    // ACTION 4: DELETE
    if (action === 'delete') {
      if (requestDoc) {
        requestDoc.status = 'DELETED';
        requestDoc.deletedAt = new Date();
        requestDoc.isReadByAdmin = true;
        requestDoc.isReadByUser = false;
        await requestDoc.save();
      }
      return NextResponse.json({
        success: true,
        message: `Notification request for "${targetName}" deleted successfully!`,
      });
    }

    return NextResponse.json({ error: 'Invalid action provided!' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/admin/guest-requests error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// PATCH: Mark admin notifications as read
export async function PATCH(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    await Promise.all([
      GuestRequest.updateMany(
        { isReadByAdmin: false },
        { $set: { isReadByAdmin: true } }
      ),
      db.collection('orders').updateMany(
        { isReadByAdmin: false },
        { $set: { isReadByAdmin: true } }
      ),
    ]);

    return NextResponse.json({ success: true, message: 'Admin notifications marked as read' });
  } catch (error) {
    console.error('PATCH /api/admin/guest-requests error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
