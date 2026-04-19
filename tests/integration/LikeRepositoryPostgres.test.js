import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pool } from '../helpers/testPool.js';
import { LikeRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/LikeRepositoryPostgres.js';
import crypto from 'crypto';

describe('LikeRepositoryPostgres', () => {
  let testUserId, testThreadId, testCommentId, testLikeId;

  const cleanup = async () => {
    // Always delete in child-first order
    // Use thread_id scope to catch any orphaned comments from prior failed runs
    await pool.query(
      'DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE thread_id = $1)',
      [testThreadId],
    );
    await pool.query('DELETE FROM comments WHERE thread_id = $1', [
      testThreadId,
    ]);
    await pool.query('DELETE FROM threads WHERE id = $1', [testThreadId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
  };

  beforeEach(async () => {
    const uniqueSuffix = crypto.randomUUID().replace(/-/g, '');
    testUserId = `user-like-${uniqueSuffix}`;
    testThreadId = `thread-like-${uniqueSuffix}`;
    testCommentId = `comment-like-${uniqueSuffix}`;
    testLikeId = `like-${uniqueSuffix}`;

    await cleanup();

    await pool.query(
      'INSERT INTO users(id, username, password, fullname) VALUES($1, $2, $3, $4)',
      [testUserId, `likeuser-${uniqueSuffix}`, 'hashed', 'Like User'],
    );
    await pool.query(
      'INSERT INTO threads(id, title, body, owner) VALUES($1, $2, $3, $4)',
      [testThreadId, 'Like Thread', 'Body', testUserId],
    );
    await pool.query(
      'INSERT INTO comments(id, thread_id, owner, content, is_delete) VALUES($1, $2, $3, $4, $5)',
      [testCommentId, testThreadId, testUserId, 'A comment', false],
    );
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should return false when like does not exist', async () => {
    const repo = new LikeRepositoryPostgres();
    const result = await repo.checkLikeExists({
      commentId: testCommentId,
      owner: testUserId,
    });
    expect(result).toBe(false);
  });

  it('should add a like', async () => {
    const repo = new LikeRepositoryPostgres();
    await expect(
      repo.addLike({
        id: testLikeId,
        commentId: testCommentId,
        owner: testUserId,
      }),
    ).resolves.not.toThrow();
  });

  it('should return true when like exists', async () => {
    const repo = new LikeRepositoryPostgres();
    await repo.addLike({
      id: testLikeId,
      commentId: testCommentId,
      owner: testUserId,
    });
    const result = await repo.checkLikeExists({
      commentId: testCommentId,
      owner: testUserId,
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
    await repo.addLike({
      id: testLikeId,
      commentId: testCommentId,
      owner: testUserId,
    });
    const count = await repo.getLikeCountByCommentId(testCommentId);
    expect(count).toBe(1);
  });

  it('should delete a like', async () => {
    const repo = new LikeRepositoryPostgres();
    await repo.addLike({
      id: testLikeId,
      commentId: testCommentId,
      owner: testUserId,
    });
    await repo.deleteLike({
      commentId: testCommentId,
      owner: testUserId,
    });
    const count = await repo.getLikeCountByCommentId(testCommentId);
    expect(count).toBe(0);
  });
});
