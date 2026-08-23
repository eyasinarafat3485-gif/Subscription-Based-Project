import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    // Fetch all users to map user roles
    const userDocs = await db.collection('user').find({}, { projection: { email: 1, role: 1 } }).toArray();
    const userRoleMap = new Map();
    userDocs.forEach((u) => {
      if (u.email) {
        userRoleMap.set(u.email.toLowerCase().trim(), u.role || 'user');
      }
    });

    // Fetch all orders from orders collection
    const rawOrders = await db.collection('orders').find({}).toArray();

    let allOrders = rawOrders.map((ord) => {
      const customerName = ord.customer?.name || ord.billingName || 'Guest Visitor';
      const customerEmail = ord.customer?.email || ord.billingEmail || 'N/A';
      const customerPhone = ord.customer?.phone || ord.billingPhone || 'N/A';
      const title = ord.productTitle || ord.planTitle || (ord.type === 'product' ? 'Product Order' : 'Membership Plan');
      const orderPrice = Number(ord.price || ord.planPrice || 0);

      const emailKey = customerEmail.toLowerCase().trim();
      let role = 'visitor';
      if (ord.isVisitor) {
        role = 'visitor';
      } else if (userRoleMap.has(emailKey)) {
        role = userRoleMap.get(emailKey) || 'user';
      } else if (ord.userId) {
        role = 'user';
      }

      return {
        _id: ord._id.toString(),
        orderId: ord.orderId || 'ORD-' + ord._id.toString().slice(-6),
        type: ord.type || 'product',
        title,
        productTitle: ord.productTitle || null,
        productSlug: ord.productSlug || null,
        productImage: ord.productImage || null,
        planTitle: ord.planTitle || null,
        price: orderPrice,
        isVisitor: Boolean(ord.isVisitor),
        role: role,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        paymentMethod: ord.paymentMethod || 'nagad',
        senderAccount: ord.senderAccount || 'N/A',
        transactionId: ord.transactionId || 'N/A',
        status: ord.status || 'completed',
        createdAt: ord.createdAt || new Date(),
      };
    });

    // Filter by search query
    if (search) {
      allOrders = allOrders.filter(
        (ord) =>
          ord.orderId.toLowerCase().includes(search) ||
          ord.title.toLowerCase().includes(search) ||
          ord.customer.name.toLowerCase().includes(search) ||
          ord.customer.email.toLowerCase().includes(search) ||
          ord.customer.phone.toLowerCase().includes(search) ||
          ord.transactionId.toLowerCase().includes(search) ||
          ord.paymentMethod.toLowerCase().includes(search)
      );
    }

    // Sort newest orders first
    allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalItems = allOrders.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const startIndex = (page - 1) * limit;
    const paginatedOrders = allOrders.slice(startIndex, startIndex + limit);

    // Calculate revenue stats
    const totalRevenue = allOrders.reduce((sum, item) => sum + (item.price || 0), 0);
    const visitorCount = allOrders.filter((o) => o.isVisitor).length;
    const registeredCount = allOrders.filter((o) => !o.isVisitor).length;

    return NextResponse.json({
      success: true,
      orders: paginatedOrders,
      page,
      limit,
      totalItems,
      totalPages,
      stats: {
        totalOrders: totalItems,
        totalRevenue,
        visitorOrders: visitorCount,
        registeredOrders: registeredCount,
      },
    });
  } catch (error) {
    console.error('GET /api/admin/public-collections error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
