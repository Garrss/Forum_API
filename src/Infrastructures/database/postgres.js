import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'garrss',
  host: 'localhost',
  database: 'forum_api',
  password: 'awaacantik',
  port: 5432
});

export default pool;