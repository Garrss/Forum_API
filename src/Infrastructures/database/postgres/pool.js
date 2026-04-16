import pg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pg;

let _pool = null;

const getPool = () => {
  if (!_pool) {
    if (process.env.DATABASE_URL) {
      _pool = new Pool({ connectionString: process.env.DATABASE_URL });
    } else {
      _pool = new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: Number(process.env.PGPORT) || 5432,
      });
    }
  }
  return _pool;
};

const pool = {
  query: (...args) => getPool().query(...args),
  end: () => (_pool ? _pool.end() : Promise.resolve()),
};

export default pool;
