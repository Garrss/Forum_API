import { describe, it, expect, vi } from 'vitest';
import { LogoutUserUseCase } from '../../src/Applications/use_case/LogoutUserUseCase.js';
import InvariantError from '../../src/Commons/exceptions/InvariantError.js';

describe('LogoutUserUseCase', () => {
  it('should throw when refresh token is not found', async () => {
    const mockAuthRepo = {
      checkTokenAvailability: vi
        .fn()
        .mockRejectedValue(new InvariantError('Refresh token not found')),
      deleteToken: vi.fn(),
    };

    const useCase = new LogoutUserUseCase({
      authenticationRepository: mockAuthRepo,
    });
    await expect(
      useCase.execute({ refreshToken: 'invalid-token' }),
    ).rejects.toThrow('Refresh token not found');
    expect(mockAuthRepo.deleteToken).not.toHaveBeenCalled();
  });

  it('should delete token when it exists', async () => {
    const mockAuthRepo = {
      checkTokenAvailability: vi.fn().mockResolvedValue(),
      deleteToken: vi.fn().mockResolvedValue(),
    };

    const useCase = new LogoutUserUseCase({
      authenticationRepository: mockAuthRepo,
    });
    await useCase.execute({ refreshToken: 'valid-token' });
    expect(mockAuthRepo.deleteToken).toHaveBeenCalledWith('valid-token');
  });

  it('should throw when refreshToken is not provided', async () => {
    const mockAuthRepo = {
      checkTokenAvailability: vi.fn(),
      deleteToken: vi.fn(),
    };

    const useCase = new LogoutUserUseCase({
      authenticationRepository: mockAuthRepo,
    });

    await expect(useCase.execute({})).rejects.toThrow(
      'Refresh token is required',
    );
  });
});
