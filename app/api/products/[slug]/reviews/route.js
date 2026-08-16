import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

function getProductQuery(identifier) {
  if (identifier && ObjectId.isValid(identifier) && String(new ObjectId(identifier)) === identifier) {
    return { $or: [{ slug: identifier }, { _id: new ObjectId(identifier) }] };
  }
  return { slug: identifier };
}

// GET: Fetch all reviews for a product
export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    // Find product to ensure it exists
    const productQuery = getProductQuery(slug);
    const product = await Product.findOne(productQuery);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get reviews sorted by newest first
    const reviews = await Review.find({ productSlug: product.slug })
      .sort({ createdAt: -1 });

    // Fetch user images & roles dynamically from the 'user' collection
    const reviewsWithAvatars = await Promise.all(
      reviews.map(async (review) => {
        const reviewObj = review.toObject();
        if (reviewObj.email) {
          const user = await db.collection('user').findOne({ 
            email: reviewObj.email.toLowerCase() 
          });
          if (user) {
            if (user.image) {
              reviewObj.userImage = user.image;
            }
            if (user.role) {
              reviewObj.userRole = user.role;
            }
          }
        }
        return reviewObj;
      })
    );

    return NextResponse.json({ success: true, reviews: reviewsWithAvatars });
  } catch (error) {
    console.error('GET /api/products/[slug]/reviews error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: Submit a new review
export async function POST(req, { params }) {
  try {
    const { slug } = await params;
    await connectToDatabase();

    // Find product to ensure it exists
    const productQuery = getProductQuery(slug);
    const product = await Product.findOne(productQuery);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await req.json();
    const { rating, comment, name, email, userImage } = body;

    // Validation
    if (!rating || !comment || !name || !email) {
      return NextResponse.json({ error: 'All fields are required!' }, { status: 400 });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5!' }, { status: 400 });
    }

    // Insert Review
    const newReview = await Review.create({
      productId: product._id,
      productSlug: product.slug,
      rating: ratingNum,
      comment: comment.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      userImage: userImage || '',
    });

    // Recalculate average rating & reviewsCount for the product
    const allReviews = await Review.find({ productSlug: product.slug });

    const reviewsCount = allReviews.length;
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Number((totalRating / reviewsCount).toFixed(1));

    // Update Product document stats directly
    await Product.updateOne(
      { _id: product._id },
      { $set: { rating: averageRating, reviewsCount: reviewsCount } }
    );

    return NextResponse.json({
      success: true,
      message: 'Review successfully submitted!',
      review: newReview,
      updatedProductStats: { rating: averageRating, reviewsCount }
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/products/[slug]/reviews error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
