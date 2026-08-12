import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import connectToDatabase from './db';

let dbInstance = null;

async function getDb() {
  if (!dbInstance) {
    const mongooseConn = await connectToDatabase();
    dbInstance = mongooseConn.connection.db;
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
});
