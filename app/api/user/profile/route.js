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

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const user = await db.collection('user').findOne({ email: session.user.email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image || null,
        bio: user.bio || '',
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('GET Profile Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, image, bio } = body;

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (image !== undefined) updateFields.image = image;
    if (bio !== undefined) updateFields.bio = bio;
    updateFields.updatedAt = new Date();

    const result = await db.collection('user').updateOne(
      { email: session.user.email.toLowerCase() },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const updatedUser = await db.collection('user').findOne({ email: session.user.email.toLowerCase() });

    return NextResponse.json({
      success: true,
      message: 'প্রোফাইল সফলভাবে ডাটাবেজে সেভ হয়েছে!',
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        bio: updatedUser.bio,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('PUT Profile Error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
