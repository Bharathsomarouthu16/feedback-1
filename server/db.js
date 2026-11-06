import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isProd } from './config.js';
import { User } from './models/User.js';
import { Feedback } from './models/Feedback.js';
import { seedFeedback } from '../src/data/seedFeedback.js';

// Serverless functions are re-invoked often; cache the connection on `globalThis`
// so warm invocations reuse it instead of opening a new one every request.
const cache = (globalThis.__mongoCache ??= { conn: null, promise: null });

async function seed() {
  // Admin account
  const email = (process.env.ADMIN_EMAIL || 'admin@loop.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || (isProd ? null : 'admin123');
  if (!password) {
    console.warn('[seed] ADMIN_PASSWORD not set in production — no admin user created.');
  } else if (!(await User.exists({ email }))) {
    await User.create({
      name: 'Admin',
      email,
      role: 'admin',
      passwordHash: await bcrypt.hash(password, 10),
    });
    console.log(`[seed] Created admin user ${email}`);
  }

  // Optional demo feedback (on by default in dev, off in production)
  const wantDemo = (process.env.SEED_DEMO_DATA ?? (isProd ? 'false' : 'true')) === 'true';
  if (wantDemo && (await Feedback.estimatedDocumentCount()) === 0) {
    await Feedback.insertMany(seedFeedback.map(({ id: _id, ...rest }) => rest));
    console.log('[seed] Inserted demo feedback');
  }
}

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  if (cache.conn) return cache.conn;
  cache.promise ??= mongoose
    .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
    .then(async (m) => {
      await seed();
      return m;
    });
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null; // allow retry on next request
    throw err;
  }
  return cache.conn;
}
