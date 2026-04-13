import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pool } from '../helpers/testPool.js';
import { LikeRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/LikeRepositoryPostgres.js';

describe('LikeRepositoryPostgres', () => {
  beforeAll(async () => {
    await pool.query(
      "DELETE FROM comment_likes WHERE comment_id='comment-like-test'",
    );
    await pool.query("DELETE FROM comments WHERE id='comment-like-test'");
    await pool.query("DELETE FROM threads WHERE id='thread-like-test'");
    await pool.query("DELETE FROM users WHERE id='user-like-test'");
    await pool.query(
      "INSERT INTO users(id,username,password,fullname) VALUES('user-like-test','likeuser','hashed','Like User')",
    );
    await pool.query(
      "INSERT INTO threads(id,title,body,owner) VALUES('thread-like-test','Like Thread','Body','user-like-test')",
    );
    await pool.query(
      "INSERT INTO comments(id,thread_id,owner,content) VALUES('comment-like-test','thread-like-test','user-like-test','A comment')",
    );
  });

  afterAll(async () => {
    await pool.query(
      "DELETE FROM comment_likes WHERE comment_id='comment-like-test'",
    );
    await pool.query("DELETE FROM comments WHERE id='comment-like-test'");
    await pool.query("DELETE FROM threads WHERE id='thread-like-test'");
    await pool.query("DELETE FROM users WHERE id='user-like-test'");
  });

  it('should return false when like does not exist', async () => {
    const repo = new LikeRepositoryPostgres();
    const result = await repo.checkLikeExists({
      commentId: 'comment-like-test',
      owner: 'user-like-test',
    });
    expect(result).toBe(false);
  });

  it('should add a like', async () => {
    const repo = new LikeRepositoryPostgres();
    await expect(
      repo.addLike({
        id: 'like-int-1',
        commentId: 'comment-like-test',
        owner: 'user-like-test',
      }),
    ).resolves.not.toThrow();
  });

  it('should return true when like exists', async () => {
    const repo = new LikeRepositoryPostgres();
    const result = await repo.checkLikeExists({
      commentId: 'comment-like-test',
      owner: 'user-like-test',
    });
    expect(result).toBe(true);
  });

  it('should return 0 when commentId is not provided', async () => {
    const repo = new LikeRepositoryPostgres();
    const count = await repo.getLikeCountByCommentId(undefined);
    expect(count).toBe(0);
  });

  it('should return correct like count', async () => {
    const repo = new LikeRepositoryPostgres();
    const count = await repo.getLikeCountByCommentId('comment-like-test');
    expect(count).toBe(1);
  });

  it('should delete a like', async () => {
    const repo = new LikeRepositoryPostgres();
    await repo.deleteLike({
      commentId: 'comment-like-test',
      owner: 'user-like-test',
    });
    const count = await repo.getLikeCountByCommentId('comment-like-test');
    expect(count).toBe(0);
  });
});
