import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock dotenv to prevent loading real .env file
vi.mock('dotenv', () => ({
  config: vi.fn(),
}));

// Mock pg module with a proper class that tracks constructor calls statically
vi.mock('pg', () => {
  const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
  const mockEnd = vi.fn().mockResolvedValue();
  let constructorCalls = [];
  let lastInstance = null;

  class MockPool {
    constructor(config) {
      constructorCalls.push(config);
      this.config = config;
      this.query = mockQuery;
      this.end = mockEnd;
      lastInstance = this;
    }
    static getConstructorCalls() {
      return constructorCalls;
    }
    static getLastInstance() {
      return lastInstance;
    }
    static clearCalls() {
      constructorCalls = [];
      lastInstance = null;
    }
  }

  return {
    default: { Pool: MockPool },
    Pool: MockPool,
  };
});

describe('pool.js', () => {
  let MockPool;

  beforeEach(async () => {
    vi.resetModules();
    // Clear all relevant env vars
    delete process.env.DATABASE_URL;
    delete process.env.PGHOST;
    delete process.env.PGUSER;
    delete process.env.PGDATABASE;
    delete process.env.PGPASSWORD;
    delete process.env.PGPORT;

    // Re-import the pool module
    await import('../../../src/Infrastructures/database/postgres/pool.js');
    const { Pool } = await import('pg');
    MockPool = Pool;
    MockPool.clearCalls();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should use DATABASE_URL if exists', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
    const freshModule =
      await import('../../../src/Infrastructures/database/postgres/pool.js');
    await freshModule.default.query('SELECT 1');
    const calls = MockPool.getConstructorCalls();
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({ connectionString: process.env.DATABASE_URL });
  });

  it('should use PGHOST fallback if DATABASE_URL not exists', async () => {
    // Ensure DATABASE_URL is not set (though already deleted in beforeEach)
    delete process.env.DATABASE_URL;
    process.env.PGHOST = 'localhost';
    process.env.PGUSER = 'garrss';
    process.env.PGDATABASE = 'forum_api';
    process.env.PGPASSWORD = 'garrss123';
    process.env.PGPORT = '5432';
    const freshModule =
      await import('../../../src/Infrastructures/database/postgres/pool.js');
    await freshModule.default.query('SELECT 1');
    const calls = MockPool.getConstructorCalls();
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      host: 'localhost',
      user: 'garrss',
      database: 'forum_api',
      password: 'garrss123',
      port: 5432,
    });
  });

  it('should use PGHOST fallback when DATABASE_URL is missing (explicit test)', async () => {
    delete process.env.DATABASE_URL;
    process.env.PGHOST = 'testhost';
    process.env.PGUSER = 'testuser';
    process.env.PGDATABASE = 'testdb';
    process.env.PGPASSWORD = 'testpass';
    process.env.PGPORT = '5433';
    const freshModule =
      await import('../../../src/Infrastructures/database/postgres/pool.js');
    await freshModule.default.query('SELECT 1');
    const calls = MockPool.getConstructorCalls();
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      host: 'testhost',
      user: 'testuser',
      database: 'testdb',
      password: 'testpass',
      port: 5433,
    });
  });

  it('should call end() on existing pool', async () => {
    process.env.DATABASE_URL = 'postgres://test';
    const freshModule =
      await import('../../../src/Infrastructures/database/postgres/pool.js');
    // First, create the pool by calling query
    await freshModule.default.query('SELECT 1');
    // Now end should be called on the existing pool
    await freshModule.default.end();
    const lastInstance = MockPool.getLastInstance();
    expect(lastInstance.end).toHaveBeenCalledTimes(1);
  });

  it('should resolve immediately when no pool exists on end()', async () => {
    vi.resetModules();
    delete process.env.DATABASE_URL;
    const freshModule =
      await import('../../../src/Infrastructures/database/postgres/pool.js');
    // No query called, so pool is null
    await expect(freshModule.default.end()).resolves.toBeUndefined();
    const calls = MockPool.getConstructorCalls();
    expect(calls).toHaveLength(0);
  });
});
