import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const product = await db.collection('products').findOne({ slug });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('GET /api/products/[slug] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const result = await db.collection('products').deleteOne({ slug });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product successfully deleted!' });
  } catch (error) {
    console.error('DELETE /api/products/[slug] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
