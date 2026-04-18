/* eslint-disable no-unused-vars */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pool } from '../helpers/testPool.js';
import { ReplyRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/ReplyRepositoryPostgres.js';
import { NotFoundError } from '../../src/Commons/exceptions/NotFoundError.js';
import { AuthorizationError } from '../../src/Commons/exceptions/AuthorizationError.js';
import crypto from 'crypto';

describe('ReplyRepositoryPostgres', () => {
  let testUserId, testThreadId, testCommentId;
  const uniqueSuffix = crypto.randomUUID().replace(/-/g, '');

  beforeEach(async () => {
    // Clean up any leftovers from previous tests
    await pool.query('DELETE FROM replies WHERE comment_id = $1', [
      testCommentId,
    ]);
    await pool.query('DELETE FROM comments WHERE id = $1', [testCommentId]);
    await pool.query('DELETE FROM threads WHERE id = $1', [testThreadId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);

    // Create fresh IDs for this test suite
    testUserId = `user-reply-${uniqueSuffix}`;
    testThreadId = `thread-reply-${uniqueSuffix}`;
    testCommentId = `comment-reply-${uniqueSuffix}`;

    // Insert user
    await pool.query(
      'INSERT INTO users(id, username, password, fullname) VALUES($1, $2, $3, $4)',
      [testUserId, `replyuser-${uniqueSuffix}`, 'hashed', 'Reply User'],
    );
    // Insert thread
    await pool.query(
      'INSERT INTO threads(id, title, body, owner) VALUES($1, $2, $3, $4)',
      [testThreadId, 'Reply Thread', 'Body', testUserId],
    );
    // Insert comment (needed for replies foreign key)
    await pool.query(
      'INSERT INTO comments(id, thread_id, owner, content, is_delete) VALUES($1, $2, $3, $4, $5)',
      [testCommentId, testThreadId, testUserId, 'A comment', false],
    );
  });

  afterEach(async () => {
    // Clean up all data after each test
    await pool.query('DELETE FROM replies WHERE comment_id = $1', [
      testCommentId,
    ]);
    await pool.query('DELETE FROM comments WHERE id = $1', [testCommentId]);
    await pool.query('DELETE FROM threads WHERE id = $1', [testThreadId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
  });

  const insertReply = async (replyId = null) => {
    const id = replyId || `reply-${crypto.randomUUID().replace(/-/g, '')}`;
    await pool.query(
      'INSERT INTO replies(id, comment_id, owner, content, is_delete) VALUES($1, $2, $3, $4, $5)',
      [id, testCommentId, testUserId, 'Integration reply', false],
    );
    return id;
  };

  it('should add reply and return id, content, owner', async () => {
    const repo = new ReplyRepositoryPostgres();
    const newReplyId = `reply-${crypto.randomUUID().replace(/-/g, '')}`;
    const result = await repo.addReply({
      id: newReplyId,
      content: 'Another integration reply',
      owner: testUserId,
      commentId: testCommentId,
    });
    expect(result.id).toBe(newReplyId);
    expect(result.content).toBe('Another integration reply');
    expect(result.owner).toBe(testUserId);
    // Clean up the added reply
    await pool.query('DELETE FROM replies WHERE id = $1', [newReplyId]);
  });

  it('should not throw when reply exists', async () => {
    const replyId = await insertReply();
    const repo = new ReplyRepositoryPostgres();
    await expect(repo.checkReplyExists(replyId)).resolves.not.toThrow();
  });

  it('should throw NotFoundError when reply does not exist', async () => {
    const repo = new ReplyRepositoryPostgres();
    await expect(repo.checkReplyExists('reply-xxx')).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should not throw when owner matches', async () => {
    const replyId = await insertReply();
    const repo = new ReplyRepositoryPostgres();
    await expect(
      repo.verifyReplyOwner({ replyId, owner: testUserId }),
    ).resolves.not.toThrow();
  });

  it('should throw AuthorizationError when owner does not match', async () => {
    const replyId = await insertReply();
    const repo = new ReplyRepositoryPostgres();
    await expect(
      repo.verifyReplyOwner({ replyId, owner: 'wrong-user' }),
    ).rejects.toThrow(AuthorizationError);
  });

  it('should soft delete reply', async () => {
    const replyId = await insertReply();
    const repo = new ReplyRepositoryPostgres();
    await repo.deleteReply(replyId);
    const result = await pool.query(
      'SELECT is_delete FROM replies WHERE id = $1',
      [replyId],
    );
    expect(result.rows[0].is_delete).toBe(true);
  });

  it('should get replies by comment ids sorted by date asc', async () => {
    const replyId = await insertReply();
    const repo = new ReplyRepositoryPostgres();
    const replies = await repo.getRepliesByCommentIds([testCommentId]);
    expect(Array.isArray(replies)).toBe(true);
    expect(replies.length).toBeGreaterThan(0);
    expect(replies[0]).toHaveProperty('username');
    expect(replies[0]).toHaveProperty('comment_id');
    expect(replies[0]).toHaveProperty('is_delete');
  });

  it('should return empty array when no comment ids provided', async () => {
    const repo = new ReplyRepositoryPostgres();
    const replies = await repo.getRepliesByCommentIds([]);
    expect(replies).toEqual([]);
  });

  it('should throw NotFoundError when deleting a non-existent reply', async () => {
    const repo = new ReplyRepositoryPostgres();
    await expect(repo.deleteReply('non-existent-id')).rejects.toThrow(
      NotFoundError,
    );
  });
});
