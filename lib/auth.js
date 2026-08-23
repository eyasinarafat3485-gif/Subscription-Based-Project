import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import connectToDatabase from './db.js';


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
      dbInstance = mongooseConn.connection.db || (mongooseConn.connection.client && mongooseConn.connection.client.db());
      if (dbInstance) {
        await seedCoupons(dbInstance);
      }
    } catch (err) {
      console.error('Database connection notice during build/auth init:', err.message);
    }
  }
  return dbInstance;
}

const db = await getDb();

const getBaseURL = () => {
  // Check for explicit Better Auth URL or Next Public App URL
  if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes('localhost:3000')) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost:3000')) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // Vercel auto-injects VERCEL_URL. Use it if available.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

export const auth = betterAuth({
  ...(db ? { database: mongodbAdapter(db) } : {}),
  secret: process.env.BETTER_AUTH_SECRET || 'fallback_secret_key_dev_club_2026',
  baseURL: getBaseURL(),
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
          return {
            data: {
              ...user,
              role: user.role || 'user',
            }
          };
        }
      }
    }
  }
});
