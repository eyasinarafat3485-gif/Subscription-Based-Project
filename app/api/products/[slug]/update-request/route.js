import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import UpdateRequest from '@/models/UpdateRequest';
import nodemailer from 'nodemailer';

const getProductQuery = (slug) => {
  return { slug: slug.toLowerCase() };
};

export async function POST(req, { params }) {
  try {
    const { slug } = await params;
    await connectToDatabase();

    const productQuery = getProductQuery(slug);
    const product = await Product.findOne(productQuery);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await req.json();
    const { requestedVersion, whatsapp, email, message } = body;

    if (!requestedVersion || !email) {
      return NextResponse.json({ error: 'Latest version and Email are required!' }, { status: 400 });
    }

    const newRequest = await UpdateRequest.create({
      productId: product._id,
      productSlug: product.slug,
      productTitle: product.title,
      requestedVersion: requestedVersion.trim(),
      whatsapp: (whatsapp || '').trim(),
      email: email.trim().toLowerCase(),
      message: (message || '').trim(),
    });

    // Send email notification to admin
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

      const mailOptions = {
        from: `"Developers Club" <${process.env.SMTP_USER || 'info@bengal-it.com'}>`,
        to: 'info@bengal-it.com',
        subject: `[Update Request] ${product.title} - Version ${requestedVersion}`,
        text: `New update request submitted:\n\n` +
              `Product: ${product.title}\n` +
              `Slug: ${product.slug}\n` +
              `Requested Version: ${requestedVersion}\n` +
              `User Email: ${email}\n` +
              `User WhatsApp: ${whatsapp || 'N/A'}\n` +
              `Message: ${message || 'N/A'}\n`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5; margin-bottom: 20px;">New Update Request</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 150px;">Product:</td>
                <td style="padding: 8px 0;">${product.title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Requested Version:</td>
                <td style="padding: 8px 0;"><span style="background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${requestedVersion}</span></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">User Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">User WhatsApp:</td>
                <td style="padding: 8px 0;">${whatsapp ? `<a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}">${whatsapp}</a>` : 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Message:</td>
                <td style="padding: 8px 0; white-space: pre-line;">${message || 'N/A'}</td>
              </tr>
            </table>
          </div>
        `,
      };

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions);
        console.log(`Email notification successfully sent to info@bengal-it.com`);
      } else {
        console.log(`[SMTP Notice] SMTP credentials not fully set. Email content output:\n`, mailOptions.text);
      }
    } catch (mailErr) {
      console.error('Failed to send SMTP email:', mailErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Update request submitted successfully!',
      updateRequest: newRequest,
    });
  } catch (error) {
    console.error('POST /api/products/[slug]/update-request error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
