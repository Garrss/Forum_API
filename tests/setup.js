import { config } from 'dotenv';

config();

// Fallbacks for CI environment
process.env.ACCESS_TOKEN_KEY =
  process.env.ACCESS_TOKEN_KEY || 'fallback_access_secret_for_testing';
process.env.REFRESH_TOKEN_KEY =
  process.env.REFRESH_TOKEN_KEY || 'fallback_refresh_secret_for_testing';
process.env.ACCESS_TOKEN_AGE = process.env.ACCESS_TOKEN_AGE || '3000';

// Set PG vars if DATABASE_URL is provided (fallback parsing)
if (!process.env.PGHOST && process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  process.env.PGHOST = url.hostname;
  process.env.PGUSER = url.username;
  process.env.PGPASSWORD = url.password;
  process.env.PGDATABASE = url.pathname.slice(1);
  process.env.PGPORT = url.port || '5432';
}
