import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import connectToDatabase from './db';

let dbInstance = null;

async function seedCoupons(db) {
  if (!db) return;
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
    console.error('Failed to seed coupons:', err.message);
  }
}

async function getDb() {
  if (!dbInstance) {
    try {
      const mongooseConn = await connectToDatabase();
      dbInstance = mongooseConn.connection.db;
      await seedCoupons(dbInstance);
    } catch (err) {
      console.error('Database connection notice during build/auth init:', err.message);
    }
  }
  return dbInstance;
}

const db = await getDb();

export const auth = betterAuth({
  ...(db ? { database: mongodbAdapter(db) } : {}),
  secret: process.env.BETTER_AUTH_SECRET || 'fallback_secret_key_dev_club_2026',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
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
            const activeDb = await getDb();
            if (activeDb) {
              const coupon = await activeDb.collection('coupons').findOne({ 
                usedBy: user.email.toLowerCase(),
                isUsed: true 
              });
              if (!coupon) {
                throw new Error('A valid coupon code is required for guest registration.');
              }
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
