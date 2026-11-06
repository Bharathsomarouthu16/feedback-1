import { useState } from 'react';
import StarRating from './StarRating';
import { CATEGORIES } from '../data/seedFeedback';

export default function FeedbackForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !category || !message.trim() || rating === 0) {
      if (rating === 0) alert('Please choose a star rating.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ name: name.trim(), category, rating, message: message.trim() });
    } catch (err) {
      setError(err?.data?.message || 'Could not send feedback. Please try again.');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setName('');
    setCategory('');
    setRating(0);
    setMessage('');
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 4000);
  }

  return (
    <section className="view">
      <h1>How did we do?</h1>
      <p className="lede">
        Takes about a minute. Your feedback goes straight to the team that can act on it.
      </p>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="f-name">Name</label>
            <input
              id="f-name"
              type="text"
              placeholder="Jordan Lee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="f-category">What's this about?</label>
            <select
              id="f-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Choose a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Overall rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="field">
            <label htmlFor="f-message">Tell us more</label>
            <textarea
              id="f-message"
              placeholder="What worked, what didn't — the more specific, the better."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send feedback'}
          </button>

          {error && <div className="form-error" role="alert">{error}</div>}

          {showConfirm && (
            <div className="confirm show">
              Thanks — your feedback was recorded. The team reviews every submission.
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
