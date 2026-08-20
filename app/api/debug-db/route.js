import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  const uri = 'mongodb://SubscriptionBassedDB:VbZu2cCtID5lF1Sy@ac-omafdbx-shard-00-00.o2gwngg.mongodb.net:27017,ac-omafdbx-shard-00-01.o2gwngg.mongodb.net:27017,ac-omafdbx-shard-00-02.o2gwngg.mongodb.net:27017/qulabi_db?ssl=true&replicaSet=atlas-omafdbx-shard-0&authSource=admin&appName=Cluster0';
  
  try {
    console.log('Starting debug connection to MongoDB Atlas...');
    const conn = await mongoose.connect(uri, { 
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false
    });
    
    const collections = await conn.connection.db.listCollections().toArray();
    const count = await conn.connection.db.collection('products').countDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB Atlas Connected Successfully from Vercel!',
      database: conn.connection.name,
      collections: collections.map(c => c.name),
      productsCount: count
    });
  } catch (err) {
    console.error('Debug connection failed:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Unknown connection error',
      details: err.toString(),
      stack: err.stack
    }, { status: 500 });
  }
}
