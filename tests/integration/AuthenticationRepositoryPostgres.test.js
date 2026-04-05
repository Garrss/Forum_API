import { describe, it, expect, afterAll } from 'vitest';
import pool from '../../src/Infrastructures/database/postgres/pool.js';
import { AuthenticationRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/AuthenticationRepositoryPostgres.js';
import { InvariantError } from '../../src/Commons/exceptions/InvariantError.js';

describe('AuthenticationRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.query(
      "DELETE FROM authentications WHERE token LIKE 'test-token%'",
    );
    await pool.end();
  });

  it('should add token to database', async () => {
    const repo = new AuthenticationRepositoryPostgres();
    await expect(repo.addToken('test-token-1')).resolves.not.toThrow();
    const result = await pool.query(
      "SELECT token FROM authentications WHERE token='test-token-1'",
    );
    expect(result.rowCount).toBe(1);
  });

  it('should not throw when token exists on checkTokenAvailability', async () => {
    const repo = new AuthenticationRepositoryPostgres();
    await expect(
      repo.checkTokenAvailability('test-token-1'),
    ).resolves.not.toThrow();
  });

  it('should throw InvariantError when token does not exist', async () => {
    const repo = new AuthenticationRepositoryPostgres();
    await expect(
      repo.checkTokenAvailability('nonexistent-token'),
    ).rejects.toThrow(InvariantError);
  });

  it('should delete token from database', async () => {
    const repo = new AuthenticationRepositoryPostgres();
    await repo.deleteToken('test-token-1');
    const result = await pool.query(
      "SELECT token FROM authentications WHERE token='test-token-1'",
    );
    expect(result.rowCount).toBe(0);
  });
});
