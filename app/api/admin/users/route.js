import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins have access!' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const query = {};

    if (role && role !== 'all') {
      query.role = role.toLowerCase();
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const totalUsers = await db.collection('user').countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(totalUsers / limit));
    const skip = (page - 1) * limit;

    const usersDocs = await db.collection('user')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const users = usersDocs.map((u) => ({
      id: u._id?.toString(),
      name: u.name || 'Anonymous User',
      email: u.email || '',
      role: u.role || 'user',
      status: u.status || 'Active',
      image: u.image || '',
      joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
      downloads: u.downloadsCount || 0,
    }));

    return NextResponse.json({
      success: true,
      page,
      limit,
      totalUsers,
      totalPages,
      users,
    });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update users!' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, email, role } = body;

    if (!role) {
      return NextResponse.json({ error: 'Please specify a role!' }, { status: 400 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    let filter = {};
    if (userId) {
      try {
        filter = { _id: new ObjectId(userId) };
      } catch {
        filter = { _id: userId };
      }
    } else if (email) {
      filter = { email: email.toLowerCase() };
    } else {
      return NextResponse.json({ error: 'User identifier is required!' }, { status: 400 });
    }

    const userDoc = await db.collection('user').findOne(filter);

    const updateFields = {
      role: role.toLowerCase(),
      updatedAt: new Date(),
    };

    if (role.toLowerCase() === 'guest') {
      const oneMonthExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      updateFields.membership = {
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
    }

    const result = await db.collection('user').updateOne(filter, {
      $set: updateFields,
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found in database!' }, { status: 404 });
    }

    // Sync GuestRequest entry so all role changes from All-Users page appear in All Notifications in serial order
    if (userDoc?.email) {
      try {
        const GuestRequest = (await import('@/models/GuestRequest')).default;
        const newStatus =
          role.toLowerCase() === 'guest' || role.toLowerCase() === 'admin'
            ? 'APPROVED'
            : 'REJECTED';

        const existingReq = await GuestRequest.findOne({
          userEmail: userDoc.email.toLowerCase(),
        }).sort({ createdAt: -1 });

        if (existingReq) {
          existingReq.status = newStatus;
          existingReq.isReadByAdmin = true;
          existingReq.isReadByUser = false;
          if (newStatus === 'APPROVED') {
            existingReq.approvedAt = new Date();
          } else {
            existingReq.rejectedAt = new Date();
          }
          await existingReq.save();
        } else {
          await GuestRequest.create({
            userId: userDoc._id,
            userName: userDoc.name || 'User',
            userEmail: userDoc.email.toLowerCase(),
            userImage: userDoc.image || '',
            userCreatedAt: userDoc.createdAt || new Date(),
            status: newStatus,
            requestedAt: new Date(),
            approvedAt: newStatus === 'APPROVED' ? new Date() : undefined,
            rejectedAt: newStatus === 'REJECTED' ? new Date() : undefined,
            isReadByAdmin: true,
            isReadByUser: false,
          });
        }
      } catch (e) {
        console.error('Failed to sync GuestRequest in PATCH:', e);
      }
    }

    const displayName = userDoc?.name || 'User';

    return NextResponse.json({
      success: true,
      message: `"${displayName}" role successfully updated to ${role.toUpperCase()}!`,
    });
  } catch (error) {
    console.error('PATCH /api/admin/users error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete users!' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required!' }, { status: 400 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    let filter = {};
    try {
      filter = { _id: new ObjectId(userId) };
    } catch {
      filter = { _id: userId };
    }

    const userDoc = await db.collection('user').findOne(filter);
    const result = await db.collection('user').deleteOne(filter);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found!' }, { status: 404 });
    }

    if (userDoc?.email) {
      try {
        const GuestRequest = (await import('@/models/GuestRequest')).default;
        await GuestRequest.updateMany(
          { userEmail: userDoc.email.toLowerCase() },
          {
            $set: {
              status: 'DELETED',
              deletedAt: new Date(),
              isReadByAdmin: true,
              isReadByUser: false,
            },
          }
        );
      } catch (e) {
        console.error('Failed to sync GuestRequest delete:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User successfully deleted from database!',
    });
  } catch (error) {
    console.error('DELETE /api/admin/users error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
