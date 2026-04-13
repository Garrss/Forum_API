import { describe, it, expect, vi } from 'vitest';
import { LoginUserUseCase } from '../../src/Applications/use_case/LoginUserUseCase.js';
import AuthenticationError from '../../src/Commons/exceptions/AuthenticationError.js';
import NotFoundError from '../../src/Commons/exceptions/NotFoundError.js';
import bcrypt from 'bcrypt';

process.env.ACCESS_TOKEN_KEY = 'test_access_secret';
process.env.REFRESH_TOKEN_KEY = 'test_refresh_secret';
process.env.ACCESS_TOKEN_AGE = '3000';

describe('LoginUserUseCase', () => {
  it('should throw AuthenticationError when password is wrong', async () => {
    const hashedPassword = await bcrypt.hash('correctpassword', 10);
    const mockUserRepo = {
      getUserByUsername: vi.fn().mockResolvedValue({
        id: 'user-1',
        username: 'johndoe',
        password: hashedPassword,
      }),
    };
    const mockAuthRepo = { addToken: vi.fn() };

    const useCase = new LoginUserUseCase({
      userRepository: mockUserRepo,
      authenticationRepository: mockAuthRepo,
    });

    await expect(
      useCase.execute({ username: 'johndoe', password: 'wrongpassword' }),
    ).rejects.toThrow(AuthenticationError);

    expect(mockUserRepo.getUserByUsername).toHaveBeenCalledWith('johndoe');

    expect(mockAuthRepo.addToken).not.toHaveBeenCalled();
  });

  it('should return accessToken and refreshToken on success', async () => {
    const hashedPassword = await bcrypt.hash('secret123', 10);

    const mockUserRepo = {
      getUserByUsername: vi.fn().mockResolvedValue({
        id: 'user-1',
        username: 'johndoe',
        password: hashedPassword,
      }),
    };

    const mockAuthRepo = {
      addToken: vi.fn().mockResolvedValue(),
    };

    const useCase = new LoginUserUseCase({
      userRepository: mockUserRepo,
      authenticationRepository: mockAuthRepo,
    });

    const result = await useCase.execute({
      username: 'johndoe',
      password: 'secret123',
    });

    expect(mockUserRepo.getUserByUsername).toHaveBeenCalledWith('johndoe');

    expect(mockAuthRepo.addToken).toHaveBeenCalledOnce();

    expect(mockAuthRepo.addToken).toHaveBeenCalledWith(result.refreshToken);

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should throw InvariantError when username is missing', async () => {
    const useCase = new LoginUserUseCase({
      userRepository: {},
      authenticationRepository: {},
    });

    await expect(useCase.execute({ password: 'secret' })).rejects.toThrow(
      'tidak dapat membuat authentication',
    );
  });

  it('should throw InvariantError when password is missing', async () => {
    const useCase = new LoginUserUseCase({
      userRepository: {},
      authenticationRepository: {},
    });

    await expect(useCase.execute({ username: 'johndoe' })).rejects.toThrow(
      'tidak dapat membuat authentication',
    );
  });

  it('should throw InvariantError when user not found', async () => {
    const mockUserRepo = {
      getUserByUsername: vi
        .fn()
        .mockRejectedValue(new NotFoundError('not found')),
    };

    const mockAuthRepo = {
      addToken: vi.fn(),
    };

    const useCase = new LoginUserUseCase({
      userRepository: mockUserRepo,
      authenticationRepository: mockAuthRepo,
    });

    await expect(
      useCase.execute({ username: 'unknown', password: 'secret' }),
    ).rejects.toThrow('kredensial yang Anda berikan salah');

    expect(mockUserRepo.getUserByUsername).toHaveBeenCalledWith('unknown');
  });

  it('should rethrow error when error is not NotFoundError', async () => {
    const mockUserRepo = {
      getUserByUsername: vi
        .fn()
        .mockRejectedValue(new Error('unexpected error')),
    };

    const mockAuthRepo = {
      addToken: vi.fn(),
    };

    const useCase = new LoginUserUseCase({
      userRepository: mockUserRepo,
      authenticationRepository: mockAuthRepo,
    });

    await expect(
      useCase.execute({ username: 'johndoe', password: 'secret' }),
    ).rejects.toThrow('unexpected error');

    expect(mockUserRepo.getUserByUsername).toHaveBeenCalledWith('johndoe');
  });

  it('should use default expiresIn when ACCESS_TOKEN_AGE is not set', async () => {
    delete process.env.ACCESS_TOKEN_AGE;

    const hashedPassword = await bcrypt.hash('secret123', 10);

    const mockUserRepo = {
      getUserByUsername: vi.fn().mockResolvedValue({
        id: 'user-1',
        username: 'johndoe',
        password: hashedPassword,
      }),
    };

    const mockAuthRepo = {
      addToken: vi.fn().mockResolvedValue(),
    };

    const useCase = new LoginUserUseCase({
      userRepository: mockUserRepo,
      authenticationRepository: mockAuthRepo,
    });

    const result = await useCase.execute({
      username: 'johndoe',
      password: 'secret123',
    });

    expect(result.accessToken).toBeDefined();
    expect(mockUserRepo.getUserByUsername).toHaveBeenCalledWith('johndoe');
  });

  it('should not call repository when username is missing', async () => {
    const mockUserRepo = { getUserByUsername: vi.fn() };

    const useCase = new LoginUserUseCase({
      userRepository: mockUserRepo,
      authenticationRepository: {},
    });

    await expect(useCase.execute({ password: 'secret' })).rejects.toThrow();

    expect(mockUserRepo.getUserByUsername).not.toHaveBeenCalled();
  });
});
