import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

async function sendOrderEmails({ orderId, orderType, itemTitle, amount, paymentMethod, senderAccount, transactionId, billingName, billingPhone, billingEmail }) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const methodUpper = String(paymentMethod).toUpperCase();

    // 1. Admin Email Notification (SMS / Order Alert)
    const adminMailOptions = {
      from: `"Developers Club System" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: `🔔 New Payment Order #${orderId} Received (${methodUpper} - ৳${amount})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">Developers Club Admin Alert</h2>
            <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">New Payment Received via ${methodUpper}</p>
          </div>
          <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
            <h3 style="margin-top: 0; color: #4f46e5;">Order #${orderId}</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
              <tr><td style="padding: 6px 0; color: #64748b;">Customer:</td><td style="font-weight: bold;">${billingName} (${billingEmail})</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Billing Phone:</td><td style="font-weight: bold;">${billingPhone}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Item / Plan:</td><td style="font-weight: bold;">${itemTitle}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Amount:</td><td style="font-weight: bold; color: #16a34a; font-size: 15px;">৳ ${amount}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Payment Method:</td><td style="font-weight: bold; text-transform: uppercase;">${methodUpper}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Sender Number:</td><td style="font-weight: bold; font-family: monospace;">${senderAccount}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Transaction ID:</td><td style="font-weight: bold; font-family: monospace; color: #4f46e5;">${transactionId}</td></tr>
            </table>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${appUrl}/dashboard/admin/all-notifications" style="display: inline-block; padding: 10px 20px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px;">View in Admin Dashboard</a>
            </div>
          </div>
        </div>
      `,
    };

    // 2. User Email Notification (Receipt & Confirmation)
    const userMailOptions = {
      from: `"Developers Club" <${process.env.SMTP_USER}>`,
      to: billingEmail,
      subject: `🎉 Payment Received & Order Confirmation #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">Payment Successful!</h2>
            <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Developers Club Order #${orderId}</p>
          </div>
          <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
            <p style="margin-top: 0;">Hello <strong>${billingName}</strong>,</p>
            <p style="font-size: 14px; color: #475569;">
              Thank you for your payment. Your order for <strong>${itemTitle}</strong> has been received and processed successfully.
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 13px;">
              <p style="margin: 0 0 8px 0;"><strong>Payment Summary:</strong></p>
              <p style="margin: 4px 0; color: #475569;">• Total Amount: <strong>৳ ${amount}</strong></p>
              <p style="margin: 4px 0; color: #475569;">• Method: <strong>${methodUpper}</strong></p>
              <p style="margin: 4px 0; color: #475569;">• Sender Account: <strong style="font-family: monospace;">${senderAccount}</strong></p>
              <p style="margin: 4px 0; color: #475569;">• Transaction ID: <strong style="font-family: monospace; color: #059669;">${transactionId}</strong></p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${appUrl}/dashboard/user/my-collections" style="display: inline-block; padding: 10px 20px; background: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px;">Go to My Dashboard</a>
            </div>
          </div>
        </div>
      `,
    };

    await Promise.allSettled([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);
  } catch (err) {
    console.error('sendOrderEmails error:', err?.message);
  }
}

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
      paymentMethod = 'bkash',
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
    const cleanTrxId = transactionId.trim().toUpperCase();
    const cleanSenderAccount = senderAccount.trim();

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
      const orderedItemTitle = productTitle || 'WordPress Item';

      const newOrder = {
        orderId,
        type: 'product',
        productId: productId || null,
        productTitle: orderedItemTitle,
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
        billingName: billingName.trim(),
        billingPhone: billingPhone.trim(),
        billingEmail: normalizedEmail,
        paymentMethod,
        senderAccount: cleanSenderAccount,
        transactionId: cleanTrxId,
        couponCode: couponCode ? couponCode.trim() : null,
        status: 'completed',
        isReadByAdmin: false,
        isReadByUser: false,
        createdAt: new Date(),
      };

      await db.collection('orders').insertOne(newOrder);

      // Create in-app Notification for the User
      const userNotification = {
        _id: 'notif_pay_' + Date.now(),
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Received & Order Successful',
        message: `Your payment of ৳${finalProductPrice} via ${paymentMethod.toUpperCase()} (TrxID: ${cleanTrxId}) for "${orderedItemTitle}" was successful!`,
        orderId,
        productTitle: orderedItemTitle,
        amount: finalProductPrice,
        paymentMethod: paymentMethod.toUpperCase(),
        transactionId: cleanTrxId,
        senderAccount: cleanSenderAccount,
        downloadedAt: new Date(),
        createdAt: new Date(),
        isRead: false,
      };

      await db.collection('user').updateOne(
        { email: normalizedEmail },
        { $push: { downloadNotifications: userNotification } }
      );

      // Trigger Email/SMS notification to Admin and Customer asynchronously
      sendOrderEmails({
        orderId,
        orderType: 'product',
        itemTitle: orderedItemTitle,
        amount: finalProductPrice,
        paymentMethod,
        senderAccount: cleanSenderAccount,
        transactionId: cleanTrxId,
        billingName: billingName.trim(),
        billingPhone: billingPhone.trim(),
        billingEmail: normalizedEmail,
      });

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
    const finalPlanPrice = Number(planPrice);

    const newOrder = {
      orderId,
      type: 'membership',
      planId,
      planTitle,
      planPrice: finalPlanPrice,
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
      senderAccount: cleanSenderAccount,
      transactionId: cleanTrxId,
      couponCode: couponCode ? couponCode.trim() : null,
      status: 'completed',
      startsAt: new Date().toISOString(),
      expiresAt,
      isReadByAdmin: false,
      isReadByUser: false,
      createdAt: new Date(),
    };

    await db.collection('orders').insertOne(newOrder);

    const membershipData = {
      planId,
      planTitle,
      planPrice: finalPlanPrice,
      status: 'active',
      startsAt: new Date().toISOString(),
      expiresAt,
      orderId,
      downloadsPerDay: planId === 'premium' ? 20 : planId === 'standard' ? 10 : 5,
      updatedAt: new Date(),
    };

    // User In-App Notification
    const userNotification = {
      _id: 'notif_pay_' + Date.now(),
      type: 'PAYMENT_SUCCESS',
      title: 'Membership Activated Successfully',
      message: `Your payment of ৳${finalPlanPrice} via ${paymentMethod.toUpperCase()} (TrxID: ${cleanTrxId}) has activated your ${planTitle}!`,
      orderId,
      productTitle: planTitle,
      amount: finalPlanPrice,
      paymentMethod: paymentMethod.toUpperCase(),
      transactionId: cleanTrxId,
      senderAccount: cleanSenderAccount,
      downloadedAt: new Date(),
      createdAt: new Date(),
      isRead: false,
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
        $push: {
          downloadNotifications: userNotification,
        },
      }
    );

    // Trigger Email/SMS notification to Admin and Customer asynchronously
    sendOrderEmails({
      orderId,
      orderType: 'membership',
      itemTitle: planTitle,
      amount: finalPlanPrice,
      paymentMethod,
      senderAccount: cleanSenderAccount,
      transactionId: cleanTrxId,
      billingName: billingName.trim(),
      billingPhone: billingPhone.trim(),
      billingEmail: normalizedEmail,
    });

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
