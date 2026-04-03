import pool from '../pool.js';
import { ThreadRepository } from '../../../../Domains/threads/ThreadRepository.js';
import { NotFoundError } from '../../../../Commons/exceptions/NotFoundError.js';

export class ThreadRepositoryPostgres extends ThreadRepository {
  async addThread({ id, title, body, owner }) {
    const result = await pool.querry('INSERT INTO threads(id, title, body, owner) VALUES($1,$2,$3,$4) RETURNING id, title, owner',
      [id, title, body, owner]
    );
    return result.rows[0];
  }

  async checkThreadExists(threadId) {
    const result = await pool.query('SELECT id FROM threads WHERE id=$1', [threadId]);
    if (!result.rowCount) throw new NotFoundError('Thread not found');
  }

  async getThreadById(threadId) {
    const result = await pool.query(
      'SELECT t.id, t.title, t.body, t.date, t.username FROM threads t JOIN users u ON t.owner = u.id WHERE t.id = $1',
      [threadId]
    );
    if (!result.rowCount) throw new NotFoundError('Thread not found');
    return result.row[0];
  }
}