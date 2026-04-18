import pool from '../pool.js';
import ReplyRepository from '../../../../Domains/replies/ReplyRepository.js';
import NotFoundError from '../../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../../Commons/exceptions/AuthorizationError.js';

export class ReplyRepositoryPostgres extends ReplyRepository {
  async addReply({ id, content, owner, commentId }) {
    const result = await pool.query(
      'INSERT INTO replies(id, comment_id, owner, content) VALUES($1,$2,$3,$4) RETURNING id, content, owner',
      [id, commentId, owner, content],
    );
    return result.rows[0];
  }

  async checkReplyExists(replyId) {
    const result = await pool.query('SELECT id FROM replies WHERE id=$1', [
      replyId,
    ]);
    if (!result.rowCount) throw new NotFoundError('Reply not found');
  }

  async verifyReplyOwner({ replyId, owner }) {
    const result = await pool.query('SELECT owner FROM replies WHERE id=$1', [
      replyId,
    ]);
    if (!result.rowCount) throw new NotFoundError('Reply not found');
    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('You are not the reply owner');
    }
  }

  async deleteReply(replyId) {
    const result = await pool.query(
      'UPDATE replies SET is_delete=true WHERE id=$1 RETURNING id',
      [replyId],
    );
    if (!result.rowCount) throw new NotFoundError('Reply not found');
  }

  async getRepliesByCommentIds(commentIds) {
    if (!commentIds.length) return [];
    const result = await pool.query(
      `SELECT r.id, r.comment_id, u.username, r.date, r.content, r.is_delete
       FROM replies r JOIN users u ON r.owner = u.id
       WHERE r.comment_id = ANY($1::text[])
       ORDER BY r.date ASC`,
      [commentIds],
    );
    return result.rows;
  }
}
