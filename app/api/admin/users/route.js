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

    const result = await db.collection('user').updateOne(filter, {
      $set: {
        role: role.toLowerCase(),
        updatedAt: new Date(),
      },
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found in database!' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User role successfully updated to ${role.toUpperCase()}!`,
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

    const result = await db.collection('user').deleteOne(filter);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found!' }, { status: 404 });
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
