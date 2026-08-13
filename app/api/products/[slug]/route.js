import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

function getProductQuery(identifier) {
  if (identifier && ObjectId.isValid(identifier) && String(new ObjectId(identifier)) === identifier) {
    return { $or: [{ slug: identifier }, { _id: new ObjectId(identifier) }] };
  }
  return { slug: identifier };
}

export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const query = getProductQuery(slug);
    const product = await db.collection('products').findOne(query);

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

    const query = getProductQuery(slug);
    const result = await db.collection('products').deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product successfully deleted!' });
  } catch (error) {
    console.error('DELETE /api/products/[slug] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await req.json();

    const {
      title,
      category,
      version,
      price,
      regularPrice,
      image,
      downloadUrl,
      demoUrl,
      description,
      features,
      bundleItems,
      isOffer,
      isPopular,
      offerEndsAt,
    } = body;

    const mongooseConn = await connectToDatabase();
    const db = mongooseConn.connection.db;

    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (category !== undefined) updateFields.category = category;
    if (version !== undefined) updateFields.version = version;
    if (price !== undefined) updateFields.price = Number(price) || 0;
    if (regularPrice !== undefined) updateFields.regularPrice = Number(regularPrice) || 0;
    if (image !== undefined) updateFields.image = image;
    if (downloadUrl !== undefined) updateFields.downloadUrl = downloadUrl.trim();
    if (demoUrl !== undefined) updateFields.demoUrl = demoUrl.trim();
    if (description !== undefined) updateFields.description = description;
    
    if (features !== undefined) {
      updateFields.features = Array.isArray(features) 
        ? features 
        : (typeof features === 'string' ? features.split('\n').map(f => f.trim()).filter(Boolean) : []);
    }
    
    if (bundleItems !== undefined) {
      updateFields.bundleItems = Array.isArray(bundleItems) ? bundleItems : [];
    }
    
    if (isOffer !== undefined) updateFields.isOffer = Boolean(isOffer);
    if (isPopular !== undefined) updateFields.isPopular = Boolean(isPopular);
    
    // Explicitly set/nullify offerEndsAt
    if (offerEndsAt !== undefined) {
      updateFields.offerEndsAt = offerEndsAt ? new Date(offerEndsAt).toISOString() : null;
    }

    updateFields.updatedAt = new Date();

    const query = getProductQuery(slug);
    const existingProduct = await db.collection('products').findOne(query);

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await db.collection('products').updateOne(
      { _id: existingProduct._id },
      { $set: updateFields }
    );

    const updatedProduct = await db.collection('products').findOne({ _id: existingProduct._id });

    return NextResponse.json({
      success: true,
      message: 'Product successfully updated!',
      product: updatedProduct
    });
  } catch (error) {
    console.error('PUT /api/products/[slug] error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
