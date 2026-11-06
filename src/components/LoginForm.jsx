import { useState } from 'react';
import { useLoginMutation } from '../store/apiSlice';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login({ email, password }).unwrap();
    } catch {
      /* error is shown from the mutation state */
    }
  }

  return (
    <section className="view">
      <h1>Admin sign in</h1>
      <p className="lede">Sign in to review and manage customer feedback.</p>
      <div className="card" style={{ maxWidth: 420 }}>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="l-email">Email</label>
            <input
              id="l-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="l-password">Password</label>
            <input
              id="l-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error.data?.message || 'Could not sign in. Is the API running?'}
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </section>
  );
}
