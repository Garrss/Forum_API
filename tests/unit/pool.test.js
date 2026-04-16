// tests/infrastructures/database/postgres/pool.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import pg from 'pg';

// Mock modul 'pg' sebelum impor manapun
vi.mock('pg', () => {
  const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
  const mockEnd = vi.fn().mockResolvedValue(undefined);
  const MockPool = vi.fn(() => ({
    query: mockQuery,
    end: mockEnd,
  }));
  return {
    default: { Pool: MockPool },
    Pool: MockPool,
  };
});

describe('database postgres pool', () => {
  let originalEnv;

  beforeEach(() => {
    // Simpan environment asli
    originalEnv = { ...process.env };
    // Reset cache modul agar _pool di-reset setiap test
    vi.resetModules();
    // Bersihkan mock calls
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Kembalikan environment semula
    process.env = originalEnv;
  });

  it('should create pool with DATABASE_URL when env var present (covers line 13)', async () => {
    // Atur environment
    process.env.DATABASE_URL = 'postgres://user:pass@host:5432/db';
    delete process.env.PGHOST;
    delete process.env.PGUSER;
    delete process.env.PGDATABASE;
    delete process.env.PGPASSWORD;
    delete process.env.PGPORT;

    // Impor ulang modul pool
    const { default: pool } =
      await import('../../../../src/infrastructures/database/postgres/pool.js');

    // Panggil query untuk memicu pembuatan pool
    await pool.query('SELECT 1');

    const MockPool = pg.Pool;
    expect(MockPool).toHaveBeenCalledTimes(1);
    expect(MockPool).toHaveBeenCalledWith({
      connectionString: 'postgres://user:pass@host:5432/db',
    });

    const mockInstance = MockPool.mock.results[0].value;
    expect(mockInstance.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('should create pool with individual params when DATABASE_URL missing', async () => {
    process.env.DATABASE_URL = undefined;
    process.env.PGHOST = 'localhost';
    process.env.PGUSER = 'testuser';
    process.env.PGDATABASE = 'testdb';
    process.env.PGPASSWORD = 'secret';
    process.env.PGPORT = '5433';

    const { default: pool } =
      await import('../../../../src/infrastructures/database/postgres/pool.js');
    await pool.query('SELECT 1');

    const MockPool = pg.Pool;
    expect(MockPool).toHaveBeenCalledTimes(1);
    expect(MockPool).toHaveBeenCalledWith({
      host: 'localhost',
      user: 'testuser',
      database: 'testdb',
      password: 'secret',
      port: 5433,
    });
  });

  it('should use default port 5432 when PGPORT not set', async () => {
    process.env.DATABASE_URL = undefined;
    process.env.PGHOST = 'localhost';
    process.env.PGUSER = 'user';
    process.env.PGDATABASE = 'db';
    process.env.PGPASSWORD = 'pass';
    delete process.env.PGPORT;

    const { default: pool } =
      await import('../../../../src/infrastructures/database/postgres/pool.js');
    await pool.query('SELECT 1');

    const MockPool = pg.Pool;
    expect(MockPool).toHaveBeenCalledWith(
      expect.objectContaining({ port: 5432 }),
    );
  });

  it('should reuse existing pool on subsequent calls', async () => {
    process.env.DATABASE_URL = 'postgres://test:5432/db';

    const { default: pool } =
      await import('../../../../src/infrastructures/database/postgres/pool.js');
    await pool.query('SELECT 1');
    await pool.query('SELECT 2');

    const MockPool = pg.Pool;
    expect(MockPool).toHaveBeenCalledTimes(1);
  });

  it('should call pool.end() when pool exists (covers true branch of ternary on line 29)', async () => {
    process.env.DATABASE_URL = 'postgres://test:5432/db';

    const { default: pool } =
      await import('../../../../src/infrastructures/database/postgres/pool.js');
    // Buat pool terlebih dahulu
    await pool.query('SELECT 1');

    const MockPool = pg.Pool;
    const mockInstance = MockPool.mock.results[0].value;

    await pool.end();
    expect(mockInstance.end).toHaveBeenCalledTimes(1);
  });

  it('should return resolved promise when end is called and pool does not exist (covers false branch of ternary on line 29)', async () => {
    process.env.DATABASE_URL = 'postgres://test:5432/db';

    const { default: pool } =
      await import('../../../../src/infrastructures/database/postgres/pool.js');
    // Jangan panggil query, sehingga _pool tetap null
    const result = await pool.end();

    expect(result).toBeUndefined(); // Promise.resolve() menghasilkan undefined
    const MockPool = pg.Pool;
    expect(MockPool).not.toHaveBeenCalled(); // Pool tidak pernah dibuat
  });
});
