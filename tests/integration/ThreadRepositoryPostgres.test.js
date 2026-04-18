import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pool } from '../helpers/testPool.js';
import { ThreadRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/ThreadRepositoryPostgres.js';
import { NotFoundError } from '../../src/Commons/exceptions/NotFoundError.js';

describe('ThreadRepositoryPostgres', () => {
  const testUserId = 'user-int-test';
  const testThreadId = 'thread-int-1';

  // Create fresh user and thread before each test
  beforeEach(async () => {
    // Clean up any leftovers
    await pool.query('DELETE FROM threads WHERE id = $1', [testThreadId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);

    // Insert user
    await pool.query(
      'INSERT INTO users(id, username, password, fullname) VALUES($1, $2, $3, $4)',
      [testUserId, 'inttest', 'hashed', 'Int Test'],
    );
    // Insert thread (needed for tests that check existence or retrieve)
    await pool.query(
      'INSERT INTO threads(id, title, body, owner) VALUES($1, $2, $3, $4)',
      [testThreadId, 'Integration Thread', 'Body text', testUserId],
    );
  });

  // Clean up after each test
  afterEach(async () => {
    await pool.query('DELETE FROM threads WHERE id = $1', [testThreadId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
  });

  it('should add a thread and return id, title, owner', async () => {
    const repo = new ThreadRepositoryPostgres();
    // Use a different ID for the add test to avoid conflict with the pre‑inserted thread
    const newThreadId = 'thread-int-2';
    const result = await repo.addThread({
      id: newThreadId,
      title: 'Another Integration Thread',
      body: 'Another body',
      owner: testUserId,
    });
    expect(result.id).toBe(newThreadId);
    expect(result.title).toBe('Another Integration Thread');
    expect(result.owner).toBe(testUserId);

    // Clean up the extra thread
    await pool.query('DELETE FROM threads WHERE id = $1', [newThreadId]);
  });

  it('should not throw when thread exists', async () => {
    const repo = new ThreadRepositoryPostgres();
    await expect(repo.checkThreadExists(testThreadId)).resolves.not.toThrow();
  });

  it('should throw NotFoundError for non-existent thread', async () => {
    const repo = new ThreadRepositoryPostgres();
    await expect(repo.checkThreadExists('thread-xxx')).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should get thread by id with username', async () => {
    const repo = new ThreadRepositoryPostgres();
    const result = await repo.getThreadById(testThreadId);
    expect(result.id).toBe(testThreadId);
    expect(result.title).toBe('Integration Thread');
    expect(result.body).toBe('Body text');
    expect(result.username).toBe('inttest');
    expect(result.date).toBeDefined();
  });

  it('should throw NotFoundError when getting non-existent thread by id', async () => {
    const repo = new ThreadRepositoryPostgres();
    await expect(repo.getThreadById('thread-xxx')).rejects.toThrow(
      NotFoundError,
    );
  });
});
