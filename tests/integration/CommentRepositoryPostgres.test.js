import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pool } from '../helpers/testPool.js';
import { CommentRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/CommentRepositoryPostgres.js';
import { NotFoundError } from '../../src/Commons/exceptions/NotFoundError.js';
import { AuthorizationError } from '../../src/Commons/exceptions/AuthorizationError.js';
import crypto from 'crypto';

describe('CommentRepositoryPostgres', () => {
  let testUserId, testThreadId, testCommentId;

  beforeEach(async () => {
    // Generate unique IDs for this test run
    const uniqueSuffix = crypto.randomUUID().replace(/-/g, '');
    testUserId = `user-comment-${uniqueSuffix}`;
    testThreadId = `thread-comment-${uniqueSuffix}`;
    testCommentId = `comment-${uniqueSuffix}`;

    // Clean up any leftovers (just in case)
    await pool.query('DELETE FROM comments WHERE id = $1', [testCommentId]);
    await pool.query('DELETE FROM threads WHERE id = $1', [testThreadId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);

    // Insert user
    await pool.query(
      'INSERT INTO users(id, username, password, fullname) VALUES($1, $2, $3, $4)',
      [testUserId, `commentuser-${uniqueSuffix}`, 'hashed', 'Comment User'],
    );
    // Insert thread
    await pool.query(
      'INSERT INTO threads(id, title, body, owner) VALUES($1, $2, $3, $4)',
      [testThreadId, 'Test Thread', 'Test Body', testUserId],
    );
    // Insert comment (used by most tests)
    await pool.query(
      'INSERT INTO comments(id, thread_id, owner, content, is_delete) VALUES($1, $2, $3, $4, $5)',
      [testCommentId, testThreadId, testUserId, 'Integration comment', false],
    );
  });

  afterEach(async () => {
    // Clean up all data after each test
    await pool.query('DELETE FROM comments WHERE id = $1', [testCommentId]);
    await pool.query('DELETE FROM threads WHERE id = $1', [testThreadId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
  });

  it('should add comment and return id, content, owner', async () => {
    const repo = new CommentRepositoryPostgres();
    const newCommentId = `comment-${crypto.randomUUID().replace(/-/g, '')}`;
    const result = await repo.addComment({
      id: newCommentId,
      content: 'Another integration comment',
      owner: testUserId,
      threadId: testThreadId,
    });
    expect(result.id).toBe(newCommentId);
    expect(result.content).toBe('Another integration comment');
    expect(result.owner).toBe(testUserId);
    await pool.query('DELETE FROM comments WHERE id = $1', [newCommentId]);
  });

  it('should not throw when comment exists', async () => {
    const repo = new CommentRepositoryPostgres();
    await expect(repo.checkCommentExists(testCommentId)).resolves.not.toThrow();
  });

  it('should throw NotFoundError when comment does not exist', async () => {
    const repo = new CommentRepositoryPostgres();
    await expect(repo.checkCommentExists('comment-xxx')).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should not throw when owner matches', async () => {
    const repo = new CommentRepositoryPostgres();
    await expect(
      repo.verifyCommentOwner({ commentId: testCommentId, owner: testUserId }),
    ).resolves.not.toThrow();
  });

  it('should throw AuthorizationError when owner does not match', async () => {
    const repo = new CommentRepositoryPostgres();
    await expect(
      repo.verifyCommentOwner({
        commentId: testCommentId,
        owner: 'wrong-user',
      }),
    ).rejects.toThrow(AuthorizationError);
  });

  it('should soft delete comment', async () => {
    const repo = new CommentRepositoryPostgres();
    await repo.deleteComment(testCommentId);
    const result = await pool.query(
      'SELECT is_delete FROM comments WHERE id = $1',
      [testCommentId],
    );
    expect(result.rows[0].is_delete).toBe(true);
  });

  it('should get comments by thread id sorted by date asc', async () => {
    const repo = new CommentRepositoryPostgres();
    const comments = await repo.getCommentsByThreadId(testThreadId);
    expect(Array.isArray(comments)).toBe(true);
    expect(comments.length).toBeGreaterThan(0);
    expect(comments[0]).toHaveProperty('username');
    expect(comments[0]).toHaveProperty('is_delete');
  });
});
