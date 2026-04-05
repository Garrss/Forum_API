import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pool from '../../src/Infrastructures/database/postgres/pool.js';
import { ThreadRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/ThreadRepositoryPostgres.js';
import { NotFoundError } from '../../src/Commons/exceptions/NotFoundError.js';

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    await pool.query(
      "INSERT INTO users(id,username,password,fullname) VALUES('user-int-test','inttest','hashed','Int Test') ON CONFLICT DO NOTHING"
    );
  });

  afterAll(async () => {
    await pool.query("DELETE FROM threads WHERE owner='user-int-test'");
    await pool.query("DELETE FROM users WHERE id='user-int-test'");
    await pool.end();
  });

  it('should add a thread and return id, title, owner', async () => {
    const repo = new ThreadRepositoryPostgres();
    const result = await repo.addThread({
      id: 'thread-int-1',
      title: 'Integration Thread',
      body: 'Body text',
      owner: 'user-int-test',
    });
    expect(result.id).toBe('thread-int-1');
    expect(result.title).toBe('Integration Thread');
    expect(result.owner).toBe('user-int-test');
  });

  it('should not throw when thread exists', async () => {
    const repo = new ThreadRepositoryPostgres();
    await expect(
      repo.checkThreadExists('thread-int-1'),
    ).resolves.not.toThrow();
  });

  it('should throw NotFoundError for non-existent thread', async () => {
    const repo = new ThreadRepositoryPostgres();
    await expect(repo.checkThreadExists('thread-xxx')).rejects.toThrow(
      NotFoundError,
    );
  });
});