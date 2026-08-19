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

    const rawCollections = user.collections || user.downloadHistory || [];
    
    // Sort collections by downloadedAt descending (newest first)
    const collections = [...rawCollections].sort((a, b) => {
      const dateA = new Date(a.downloadedAt || 0);
      const dateB = new Date(b.downloadedAt || 0);
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      collections,
    });
  } catch (error) {
    console.error('GET User Collections Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
