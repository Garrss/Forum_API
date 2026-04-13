import pool from '../pool.js';
import LikeRepository from '../../../../Domains/likes/LikeRepository.js';

export class LikeRepositoryPostgres extends LikeRepository {
  async addLike({ id, commentId, owner }) {
    await pool.query(
      'INSERT INTO comment_likes(id, comment_id, owner) VALUES($1,$2,$3)',
      [id, commentId, owner],
    );
  }

  async deleteLike({ commentId, owner }) {
    await pool.query(
      'DELETE FROM comment_likes WHERE comment_id=$1 AND owner=$2',
      [commentId, owner],
    );
  }

  async checkLikeExists({ commentId, owner }) {
    const result = await pool.query(
      'SELECT id FROM comment_likes WHERE comment_id=$1 AND owner=$2',
      [commentId, owner],
    );
    return result.rowCount > 0;
  }

  async getLikeCountByCommentId(commentId) {
    if (!commentId) return 0;
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id=$1',
      [commentId],
    );
    return parseInt(result.rows[0].count, 10);
  }
}
