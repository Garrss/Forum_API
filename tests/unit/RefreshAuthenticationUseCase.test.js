import { describe, it, expect, vi } from 'vitest';
import { RefreshAuthenticationUseCase } from '../../src/Applications/use_case/RefreshAuthenticationUseCase.js';
import InvariantError from '../../src/Commons/exceptions/InvariantError.js';
import jwt from 'jsonwebtoken';

process.env.ACCESS_TOKEN_KEY = 'test_access_secret';
process.env.REFRESH_TOKEN_KEY = 'test_refresh_secret';
process.env.ACCESS_TOKEN_AGE = '3000';

describe('RefreshAuthenticationUseCase', () => {
  it('should throw when refresh token is not in database', async () => {
    const mockAuthRepo = {
      checkTokenAvailability: vi
        .fn()
        .mockRejectedValue(new InvariantError('Refresh token not found')),
    };

    const useCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthRepo,
    });
    await expect(
      useCase.execute({ refreshToken: 'invalid-token' }),
    ).rejects.toThrow('refresh token tidak valid');
  });

  it('should return new accessToken when refresh token is valid', async () => {
    const refreshToken = jwt.sign(
      { id: 'user-1', username: 'johndoe' },
      process.env.REFRESH_TOKEN_KEY,
    );
    const mockAuthRepo = {
      checkTokenAvailability: vi.fn().mockResolvedValue(),
    };

    const useCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthRepo,
    });
    const result = await useCase.execute({ refreshToken });

    expect(result.accessToken).toBeDefined();
    const decoded = jwt.verify(
      result.accessToken,
      process.env.ACCESS_TOKEN_KEY,
    );
    expect(decoded.username).toBe('johndoe');
  });

  it('should throw when refresh token is invalid (jwt verify fails)', async () => {
    const mockAuthRepo = {
      checkTokenAvailability: vi.fn().mockResolvedValue(),
    };

    const useCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthRepo,
    });

    await expect(
      useCase.execute({ refreshToken: 'invalid-token' }),
    ).rejects.toThrow('refresh token tidak valid');
  });

  it('should throw when refresh token is not provided', async () => {
    const mockAuthRepo = {
      checkTokenAvailability: vi.fn(),
    };

    const useCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthRepo,
    });

    await expect(useCase.execute({})).rejects.toThrow(
      'tidak dapat memperbarui authentication',
    );
  });

  it('should throw when refresh token not found in database after valid jwt', async () => {
    const refreshToken = jwt.sign(
      { id: 'user-1', username: 'johndoe' },
      process.env.REFRESH_TOKEN_KEY,
    );

    const mockAuthRepo = {
      checkTokenAvailability: vi
        .fn()
        .mockRejectedValue(new InvariantError('not found')),
    };

    const useCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthRepo,
    });

    await expect(useCase.execute({ refreshToken })).rejects.toThrow(
      'not found',
    );
  });

  it('should use default expiresIn when ACCESS_TOKEN_AGE is not set', async () => {
    delete process.env.ACCESS_TOKEN_AGE;

    const refreshToken = jwt.sign(
      { id: 'user-1', username: 'johndoe' },
      process.env.REFRESH_TOKEN_KEY,
    );

    const mockAuthRepo = {
      checkTokenAvailability: vi.fn().mockResolvedValue(),
    };

    const useCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthRepo,
    });

    const result = await useCase.execute({ refreshToken });

    expect(result.accessToken).toBeDefined();
  });
});
