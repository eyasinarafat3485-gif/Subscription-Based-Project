import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    let reviews = await db.collection('reviews').find({}).sort({ createdAt: -1 }).toArray();

    // If empty, seed initial reviews into reviews collection
    if (!reviews || reviews.length === 0) {
      await db.collection('reviews').insertMany(INITIAL_REVIEWS);
      reviews = await db.collection('reviews').find({}).sort({ createdAt: -1 }).toArray();
    }

    const totalReviews = reviews.length;
    const totalScore = reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
    const averageRating = totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(1)) : 5.0;

    let ratingText = 'Excellent';
    if (averageRating >= 4.5) ratingText = 'Excellent';
    else if (averageRating >= 4.0) ratingText = 'Great';
    else if (averageRating >= 3.0) ratingText = 'Good';
    else ratingText = 'Average';

    return NextResponse.json({
      success: true,
      reviews,
      totalReviews,
      averageRating,
      ratingText,
    });
  } catch (error) {
    console.error('GET /api/reviews error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fetch reviews',
      details: error.toString(),
      stack: error.stack
    }, { status: 500 });
  }
}

// POST: Submit a new review to site_reviews collection
export async function POST(req) {
  try {
    const { auth } = await import('@/lib/auth');
    const { headers } = await import('next/headers');

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Please log in to submit a review!' }, { status: 401 });
    }

    const body = await req.json();
    const { comment, rating, role } = body;

    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: 'Please write a review comment!' }, { status: 400 });
    }

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const user = await db.collection('user').findOne({ email: session.user.email.toLowerCase() });

    const newReview = {
      name: user?.name || session.user.name || 'Member',
      email: session.user.email.toLowerCase(),
      role: role || (user?.role === 'admin' ? 'System Admin' : user?.role === 'guest' ? 'VIP Guest Member' : 'PRO Member'),
      avatar: user?.image || session.user.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      comment: comment.trim(),
      rating: Number(rating) || 5,
      createdAt: new Date().toISOString(),
    };

    await db.collection('reviews').insertOne(newReview);

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review has been published successfully.',
      review: newReview,
    });
  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit review' }, { status: 500 });
  }
}
