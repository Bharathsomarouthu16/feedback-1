import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { getJwtSecret, JWT_EXPIRES_IN } from './config.js';
import { connectDB } from './db.js';
import { User } from './models/User.js';
import { Feedback, STATUSES } from './models/Feedback.js';
import { notifyLowRating } from './notify.js';

const JWT_SECRET = getJwtSecret();

const publicUser = (u) => ({ id: u._id.toString(), name: u.name, email: u.email, role: u.role });
const signToken = (u) =>
  jwt.sign({ sub: u._id.toString(), role: u.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

async function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing or malformed Authorization header' });
  }
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res
      .status(401)
      .json({ message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' });
  }
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ message: 'User no longer exists' });
  req.user = user;
  next();
}

const requireRole = (role) => (req, res, next) =>
  req.user.role === role ? next() : res.status(403).json({ message: 'Forbidden' });

const app = express();
app.use(cors());
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Connect to MongoDB (cached) before any data route.
app.use('/api', async (_req, _res, next) => {
  await connectDB();
  next();
});

// ---- Auth ----
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: signToken(user), user: publicUser(user) });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// ---- Feedback ----
// Public: anyone can submit.
app.post('/api/feedback', async (req, res) => {
  const { name, category, rating, message } = req.body || {};
  let entry;
  try {
    entry = await Feedback.create({ name, category, rating: Number(rating), message });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: 'Invalid feedback payload' });
    }
    throw err;
  }
  await notifyLowRating(entry); // third-party email alert (no-op unless configured)
  res.status(201).json({ id: entry._id.toString() });
});

// Admin only.
app.get('/api/feedback', authenticate, requireRole('admin'), async (_req, res) => {
  res.json(await Feedback.find().sort({ createdAt: -1, _id: -1 }));
});

app.patch('/api/feedback/:id/status', authenticate, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Feedback not found' });
  if (!STATUSES.includes(req.body?.status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const item = await Feedback.findByIdAndUpdate(id, { status: req.body.status }, { new: true });
  if (!item) return res.status(404).json({ message: 'Feedback not found' });
  res.json(item);
});

// ---- Errors ----
app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

export default app;
