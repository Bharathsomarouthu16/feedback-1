export const isProd = process.env.NODE_ENV === 'production';

export function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (isProd) throw new Error('JWT_SECRET must be set in production');
  console.warn('[auth] JWT_SECRET not set — using an insecure dev secret.');
  return 'dev-only-secret-change-me';
}

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
