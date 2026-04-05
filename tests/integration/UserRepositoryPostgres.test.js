import { describe, it, expect, afterAll } from 'vitest';
import pool from '../../src/Infrastructures/database/postgres/pool.js';
import { UserRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/UserRepositoryPostgres.js';
import { InvariantError } from '../../src/Commons/exceptions/InvariantError.js';
import { NotFoundError } from '../../src/Commons/exceptions/NotFoundError.js';

describe('UserRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE id LIKE 'user-int-%'");
    await pool.end();
  });

  it('should add user and return id, username, fullname', async () => {
    const repo = new UserRepositoryPostgres();
    const result = await repo.addUser({
      id: 'user-int-1',
      username: 'intuser1',
      password: 'hashedpassword',
      fullname: 'Integration User',
    });
    expect(result.id).toBe('user-int-1');
    expect(result.username).toBe('intuser1');
    expect(result.fullname).toBe('Integration User');
  });

  it('should throw InvariantError when username already taken', async () => {
    const repo = new UserRepositoryPostgres();
    await expect(repo.checkUsernameAvailability('intuser1')).rejects.toThrow(
      InvariantError,
    );
  });

  it('should not throw when username is available', async () => {
    const repo = new UserRepositoryPostgres();
    await expect(
      repo.checkUsernameAvailability('newusername'),
    ).resolves.not.toThrow();
  });

  it('should get user by username', async () => {
    const repo = new UserRepositoryPostgres();
    const user = await repo.getUserByUsername('intuser1');
    expect(user.username).toBe('intuser1');
    expect(user.password).toBeDefined();
  });

  it('should throw NotFoundError when user not found by username', async () => {
    const repo = new UserRepositoryPostgres();
    await expect(repo.getUserByUsername('nonexistent')).rejects.toThrow(
      NotFoundError,
    );
  });
});
