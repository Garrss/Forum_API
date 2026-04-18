import { describe, it, expect } from 'vitest';
import { pool } from '../helpers/testPool.js';
import { CommentRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/CommentRepositoryPostgres.js';
import { NotFoundError } from '../../src/Commons/exceptions/NotFoundError.js';
import { AuthorizationError } from '../../src/Commons/exceptions/AuthorizationError.js';
import crypto from 'crypto';

describe('CommentRepositoryPostgres', () => {
  const setupBase = async () => {
    const uniqueSuffix = crypto.randomUUID().replace(/-/g, '');
    const userId = `user-comment-${uniqueSuffix}`;
    const threadId = `thread-comment-${uniqueSuffix}`;
    const commentId = `comment-${uniqueSuffix}`;

    await pool.query(
      'INSERT INTO users(id, username, password, fullname) VALUES($1, $2, $3, $4)',
      [userId, `commentuser-${uniqueSuffix}`, 'hashed', 'Comment User'],
    );
    await pool.query(
      'INSERT INTO threads(id, title, body, owner) VALUES($1, $2, $3, $4)',
      [threadId, 'Test Thread', 'Test Body', userId],
    );
    await pool.query(
      'INSERT INTO comments(id, thread_id, owner, content, is_delete) VALUES($1, $2, $3, $4, $5)',
      [commentId, threadId, userId, 'Integration comment', false],
    );
    return { userId, threadId, commentId };
  };

  const cleanup = async (userId, threadId, commentId) => {
    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
    await pool.query('DELETE FROM threads WHERE id = $1', [threadId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  };

  it('should add comment and return id, content, owner', async () => {
    const { userId, threadId } = await setupBase();
    const repo = new CommentRepositoryPostgres();
    const newCommentId = `comment-${crypto.randomUUID().replace(/-/g, '')}`;
    const result = await repo.addComment({
      id: newCommentId,
      content: 'Another integration comment',
      owner: userId,
      threadId: threadId,
    });
    expect(result.id).toBe(newCommentId);
    expect(result.content).toBe('Another integration comment');
    expect(result.owner).toBe(userId);
    await cleanup(userId, threadId, newCommentId);
  });

  it('should not throw when comment exists', async () => {
    const { userId, threadId, commentId } = await setupBase();
    const repo = new CommentRepositoryPostgres();
    await expect(repo.checkCommentExists(commentId)).resolves.not.toThrow();
    await cleanup(userId, threadId, commentId);
  });

  it('should throw NotFoundError when comment does not exist', async () => {
    const { userId, threadId, commentId } = await setupBase();
    const repo = new CommentRepositoryPostgres();
    await expect(repo.checkCommentExists('comment-xxx')).rejects.toThrow(
      NotFoundError,
    );
    await cleanup(userId, threadId, commentId);
  });

  it('should not throw when owner matches', async () => {
    const { userId, threadId, commentId } = await setupBase();
    const repo = new CommentRepositoryPostgres();
    await expect(
      repo.verifyCommentOwner({ commentId, owner: userId }),
    ).resolves.not.toThrow();
    await cleanup(userId, threadId, commentId);
  });

  it('should throw AuthorizationError when owner does not match', async () => {
    const { userId, threadId, commentId } = await setupBase();
    const repo = new CommentRepositoryPostgres();
    await expect(
      repo.verifyCommentOwner({ commentId, owner: 'wrong-user' }),
    ).rejects.toThrow(AuthorizationError);
    await cleanup(userId, threadId, commentId);
  });

  it('should soft delete comment', async () => {
    const { userId, threadId, commentId } = await setupBase();
    const repo = new CommentRepositoryPostgres();
    await repo.deleteComment(commentId);
    const result = await pool.query(
      'SELECT is_delete FROM comments WHERE id = $1',
      [commentId],
    );
    expect(result.rows[0].is_delete).toBe(true);
    await cleanup(userId, threadId, commentId);
  });

  it('should get comments by thread id sorted by date asc', async () => {
    const { userId, threadId, commentId } = await setupBase();
    const repo = new CommentRepositoryPostgres();
    const comments = await repo.getCommentsByThreadId(threadId);
    expect(Array.isArray(comments)).toBe(true);
    expect(comments.length).toBeGreaterThan(0);
    expect(comments[0]).toHaveProperty('username');
    expect(comments[0]).toHaveProperty('is_delete');
    await cleanup(userId, threadId, commentId);
  });
});
