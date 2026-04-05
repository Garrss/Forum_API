import pool from '../../src/Infrastructures/database/postgres/pool.js';

export const cleanTable = async (tables) => {
  for (const table of tables) {
    await pool.query(`DELETE FROM ${table}`);
  }
};

export { pool };
