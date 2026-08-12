import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import connectToDatabase from './db';

let dbInstance = null;

async function seedCoupons(db) {
  try {
    const count = await db.collection('coupons').countDocuments();
    if (count === 0) {
      await db.collection('coupons').insertMany([
        { code: 'VIP2026', isUsed: false, usedBy: null, expiresAt: null, createdAt: new Date() },
        { code: 'BENGALVIP', isUsed: false, usedBy: null, expiresAt: null, createdAt: new Date() },
        { code: 'DEVELOPERVIP', isUsed: false, usedBy: null, expiresAt: null, createdAt: new Date() }
      ]);
      console.log('Seeded default coupons successfully.');
    }
  } catch (err) {
    console.error('Failed to seed coupons:', err);
  }
}

async function getDb() {
  if (!dbInstance) {
    const mongooseConn = await connectToDatabase();
    dbInstance = mongooseConn.connection.db;
    await seedCoupons(dbInstance);
  }
  return dbInstance;
}

export const auth = betterAuth({
  database: mongodbAdapter(await getDb()),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.role === 'guest') {
            const db = await getDb();
            const coupon = await db.collection('coupons').findOne({ 
              usedBy: user.email.toLowerCase(),
              isUsed: true 
            });
            if (!coupon) {
              throw new Error('গেস্ট রেজিস্ট্রেশনের জন্য ভ্যালিড কুপন কোড প্রয়োজন।');
            }
          }
          return {
            data: user
          };
        }
      }
    }
  }
});
