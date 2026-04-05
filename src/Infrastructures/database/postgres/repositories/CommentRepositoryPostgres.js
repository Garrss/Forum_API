import pool from '../pool.js';
import CommentRepository from '../../../../Domains/comments/CommentRepository.js';
import NotFoundError from '../../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../../Commons/exceptions/AuthorizationError.js';

export class CommentRepositoryPostgres extends CommentRepository {
  async addComment({ id, content, owner, threadId }) {
    const result = await pool.query(
      'INSERT INTO comments(id, thread_id, owner, content) VALUES($1,$2,$3,$4) RETURNING id, content, owner',
      [id, threadId, owner, content],
    );
    return result.rows[0];
  }

  async checkCommentExists(commentId) {
    const result = await pool.query('SELECT id FROM comments WHERE id=$1', [
      commentId,
    ]);
    if (!result.rowCount) throw new NotFoundError('Comment not found');
  }

  async verifyCommentOwner({ commentId, owner }) {
    const result = await pool.query('SELECT owner FROM comments WHERE id=$1', [
      commentId,
    ]);
    if (result.rows[0].owner !== owner)
      throw new AuthorizationError('You are not the comment owner');
  }

  async deleteComment(commentId) {
    await pool.query('UPDATE comments SET is_delete=true WHERE id=$1', [
      commentId,
    ]);
  }

  async getCommentsByThreadId(threadId) {
    const result = await pool.query(
      `SELECT c.id, u.username, c.date, c.content, c.is_delete
       FROM comments c JOIN users u ON c.owner = u.id
       WHERE c.thread_id = $1
       ORDER BY c.date ASC`,
      [threadId],
    );
    return result.rows;
  }
}