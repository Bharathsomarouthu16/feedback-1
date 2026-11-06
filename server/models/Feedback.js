import mongoose from 'mongoose';
import { CATEGORIES } from '../../src/data/seedFeedback.js';

export const STATUSES = ['Open', 'Reviewed', 'Actioned'];

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, required: true, enum: CATEGORIES },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: STATUSES, default: 'Open' },
  },
  {
    timestamps: true,
    // Expose `id` (string) instead of `_id` so the React app doesn't need to change.
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
