import mongoose from 'mongoose';
import dns from 'node:dns';

// Fix for local DNS SRV lookup failure (querySrv ECONNREFUSED) on Windows/local networks
if (typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {
    // Ignore if environment prevents updating DNS servers
  }
}

const directFallbackUri = 'mongodb://SubscriptionBassedDB:VbZu2cCtID5lF1Sy@ac-omafdbx-shard-00-00.o2gwngg.mongodb.net:27017,ac-omafdbx-shard-00-01.o2gwngg.mongodb.net:27017,ac-omafdbx-shard-00-02.o2gwngg.mongodb.net:27017/qulabi_db?ssl=true&replicaSet=atlas-yda3va-shard-0&authSource=admin&appName=Cluster0';

const getMongoUri = () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  return directFallbackUri;
};

const MONGODB_URI = getMongoUri();

let cached = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase() {
  if (cached.conn && mongoose.connection.readyState >= 1) {
    if (!mongoose.connection.db && mongoose.connection.client) {
      mongoose.connection.db = mongoose.connection.client.db();
    }
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 8000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .catch(async (err) => {
        console.warn('Primary MongoDB URI connection failed (' + (err.message || err) + '), retrying with direct seedlist URI...');
        return mongoose.connect(directFallbackUri, opts);
      })
      .then((mongooseInstance) => {

        console.log('MongoDB Connected Successfully on Vercel/Local');
        if (!mongooseInstance.connection.db && mongooseInstance.connection.client) {
          mongooseInstance.connection.db = mongooseInstance.connection.client.db();
        }
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error('MongoDB Connection Error:', err.message || err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    if (!mongoose.connection.db && mongoose.connection.client) {
      mongoose.connection.db = mongoose.connection.client.db();
    }
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;

