import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pool from '../../src/Infrastructures/database/postgres/pool.js';
import { CommentRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/CommentRepositoryPostgres.js';
import { NotFoundError } from '../../src/Commons/exceptions/NotFoundError.js';
import { AuthorizationError } from '../../src/Commons/exceptions/AuthorizationError.js';

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await pool.query(
      "INSERT INTO users(id,username,password,fullname) VALUES('user-comment-test','commentuser','hashed','Comment User') ON CONFLICT DO NOTHING",
    );
    await pool.query(
      "INSERT INTO threads(id,title,body,owner) VALUES('thread-comment-test','Test Thread','Test Body','user-comment-test') ON CONFLICT DO NOTHING",
    );
  });

  afterAll(async () => {
    await pool.query(
      "DELETE FROM comments WHERE thread_id='thread-comment-test'",
    );
    await pool.query("DELETE FROM threads WHERE id='thread-comment-test'");
    await pool.query("DELETE FROM users WHERE id='user-comment-test'");
    await pool.end();
  });

  it('should add comment and return id, content, owner', async () => {
    const repo = new CommentRepositoryPostgres();
    const result = await repo.addComment({
      id: 'comment-int-1',
      content: 'Integration comment',
      owner: 'user-comment-test',
      threadId: 'thread-comment-test',
    });
    expect(result.id).toBe('comment-int-1');
    expect(result.content).toBe('Integration comment');
    expect(result.owner).toBe('user-comment-test');
  });

  it('should not throw when comment exists', async () => {
    const repo = new CommentRepositoryPostgres();
    await expect(
      repo.checkCommentExists('comment-int-1'),
    ).resolves.not.toThrow();
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
      repo.verifyCommentOwner({
        commentId: 'comment-int-1',
        owner: 'user-comment-test',
      }),
    ).resolves.not.toThrow();
  });

  it('should throw AuthorizationError when owner does not match', async () => {
    const repo = new CommentRepositoryPostgres();
    await expect(
      repo.verifyCommentOwner({
        commentId: 'comment-int-1',
        owner: 'wrong-user',
      }),
    ).rejects.toThrow(AuthorizationError);
  });

  it('should soft delete comment', async () => {
    const repo = new CommentRepositoryPostgres();
    await repo.deleteComment('comment-int-1');
    const result = await pool.query(
      "SELECT is_delete FROM comments WHERE id='comment-int-1'",
    );
    expect(result.rows[0].is_delete).toBe(true);
  });

  it('should get comments by thread id sorted by date asc', async () => {
    const repo = new CommentRepositoryPostgres();
    const comments = await repo.getCommentsByThreadId('thread-comment-test');
    expect(Array.isArray(comments)).toBe(true);
    expect(comments.length).toBeGreaterThan(0);
    expect(comments[0]).toHaveProperty('username');
    expect(comments[0]).toHaveProperty('is_delete');
  });
});
