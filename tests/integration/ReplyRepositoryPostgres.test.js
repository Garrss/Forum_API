import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pool } from '../helpers/testPool.js';
import { ReplyRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/ReplyRepositoryPostgres.js';
import { NotFoundError } from '../../src/Commons/exceptions/NotFoundError.js';
import { AuthorizationError } from '../../src/Commons/exceptions/AuthorizationError.js';

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    await pool.query("DELETE FROM replies WHERE id='reply-int-1'");
    await pool.query("DELETE FROM comments WHERE id='comment-reply-test'");
    await pool.query("DELETE FROM threads WHERE id='thread-reply-test'");
    await pool.query("DELETE FROM users WHERE id='user-reply-test'");
    await pool.query(
      "INSERT INTO users(id,username,password,fullname) VALUES('user-reply-test','replyuser','hashed','Reply User')",
    );
    await pool.query(
      "INSERT INTO threads(id,title,body,owner) VALUES('thread-reply-test','Reply Thread','Body','user-reply-test')",
    );
    await pool.query(
      "INSERT INTO comments(id,thread_id,owner,content) VALUES('comment-reply-test','thread-reply-test','user-reply-test','A comment')",
    );
  });

  afterAll(async () => {
    await pool.query("DELETE FROM replies WHERE id='reply-int-1'");
    await pool.query("DELETE FROM comments WHERE id='comment-reply-test'");
    await pool.query("DELETE FROM threads WHERE id='thread-reply-test'");
    await pool.query("DELETE FROM users WHERE id='user-reply-test'");
  });

  it('should add reply and return id, content, owner', async () => {
    const repo = new ReplyRepositoryPostgres();
    const result = await repo.addReply({
      id: 'reply-int-1',
      content: 'Integration reply',
      owner: 'user-reply-test',
      commentId: 'comment-reply-test',
    });
    expect(result.id).toBe('reply-int-1');
    expect(result.content).toBe('Integration reply');
    expect(result.owner).toBe('user-reply-test');
  });

  it('should not throw when reply exists', async () => {
    const repo = new ReplyRepositoryPostgres();
    await expect(repo.checkReplyExists('reply-int-1')).resolves.not.toThrow();
  });

  it('should throw NotFoundError when reply does not exist', async () => {
    const repo = new ReplyRepositoryPostgres();
    await expect(repo.checkReplyExists('reply-xxx')).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should not throw when owner matches', async () => {
    const repo = new ReplyRepositoryPostgres();
    await expect(
      repo.verifyReplyOwner({
        replyId: 'reply-int-1',
        owner: 'user-reply-test',
      }),
    ).resolves.not.toThrow();
  });

  it('should throw AuthorizationError when owner does not match', async () => {
    const repo = new ReplyRepositoryPostgres();
    await expect(
      repo.verifyReplyOwner({ replyId: 'reply-int-1', owner: 'wrong-user' }),
    ).rejects.toThrow(AuthorizationError);
  });

  it('should soft delete reply', async () => {
    const repo = new ReplyRepositoryPostgres();
    await repo.deleteReply('reply-int-1');
    const result = await pool.query(
      "SELECT is_delete FROM replies WHERE id='reply-int-1'",
    );
    expect(result.rows[0].is_delete).toBe(true);
  });

  it('should get replies by comment ids sorted by date asc', async () => {
    const repo = new ReplyRepositoryPostgres();
    const replies = await repo.getRepliesByCommentIds(['comment-reply-test']);
    expect(Array.isArray(replies)).toBe(true);
    expect(replies[0]).toHaveProperty('username');
    expect(replies[0]).toHaveProperty('comment_id');
    expect(replies[0]).toHaveProperty('is_delete');
  });

  it('should return empty array when no comment ids provided', async () => {
    const repo = new ReplyRepositoryPostgres();
    const replies = await repo.getRepliesByCommentIds([]);
    expect(replies).toEqual([]);
  });
});
