import { describe, it, expect, vi } from 'vitest';
import { LoginUserUseCase } from '../../src/Applications/use_case/LoginUserUseCase.js';
import AuthenticationError from '../../src/Commons/exceptions/AuthenticationError.js';
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
    const mockAuthRepo = { addToken: vi.fn().mockResolvedValue() };

    const useCase = new LoginUserUseCase({
      userRepository: mockUserRepo,
      authenticationRepository: mockAuthRepo,
    });

    const result = await useCase.execute({
      username: 'johndoe',
      password: 'secret123',
    });

    expect(mockAuthRepo.addToken).toHaveBeenCalledOnce();
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });
});
