import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://SubscriptionBassedDB:VbZu2cCtID5lF1Sy@ac-omafdbx-shard-00-00.o2gwngg.mongodb.net:27017,ac-omafdbx-shard-00-01.o2gwngg.mongodb.net:27017,ac-omafdbx-shard-00-02.o2gwngg.mongodb.net:27017/qulabi_db?ssl=true&replicaSet=atlas-yda3va-shard-0&authSource=admin&appName=Cluster0';

let cached = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
