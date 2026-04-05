import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pool } from '../helpers/testPool.js';
import { UserRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/UserRepositoryPostgres.js';
import { InvariantError } from '../../src/Commons/exceptions/InvariantError.js';
import { NotFoundError } from '../../src/Commons/exceptions/NotFoundError.js';

describe('UserRepositoryPostgres', () => {
  beforeAll(async () => {
    await pool.query("DELETE FROM users WHERE id='user-int-1'");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE id='user-int-1'");
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
    expect(user.fullname).toBe('Integration User');
  });

  it('should throw NotFoundError when user not found by username', async () => {
    const repo = new UserRepositoryPostgres();
    await expect(repo.getUserByUsername('nonexistent')).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should get user by id', async () => {
    const repo = new UserRepositoryPostgres();
    const user = await repo.getUserById('user-int-1');
    expect(user.id).toBe('user-int-1');
    expect(user.username).toBe('intuser1');
  });

  it('should throw NotFoundError when user not found by id', async () => {
    const repo = new UserRepositoryPostgres();
    await expect(repo.getUserById('user-xxx')).rejects.toThrow(NotFoundError);
  });
});
