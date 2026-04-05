import { describe, it, expect, vi } from 'vitest';
import { RegisterUserUseCase } from '../../src/Applications/use_case/RegisterUserUseCase.js';
import InvariantError from '../../src/Commons/exceptions/InvariantError.js';

describe('RegisterUserUseCase', () => {
  it('should throw when username already taken', async () => {
    const mockUserRepo = {
      checkUsernameAvailability: vi
        .fn()
        .mockRejectedValue(new InvariantError('Username already taken')),
      addUser: vi.fn(),
    };

    const useCase = new RegisterUserUseCase({ userRepository: mockUserRepo });
    await expect(
      useCase.execute({
        username: 'taken',
        password: 'secret',
        fullname: 'Taken User',
      }),
    ).rejects.toThrow('Username already taken');
    expect(mockUserRepo.addUser).not.toHaveBeenCalled();
  });

  it('should register user correctly', async () => {
    const mockUserRepo = {
      checkUsernameAvailability: vi.fn().mockResolvedValue(),
      addUser: vi
        .fn()
        .mockResolvedValue({
          id: 'user-1',
          username: 'johndoe',
          fullname: 'John Doe',
        }),
    };

    const useCase = new RegisterUserUseCase({ userRepository: mockUserRepo });
    const result = await useCase.execute({
      username: 'johndoe',
      password: 'secret123',
      fullname: 'John Doe',
    });

    expect(mockUserRepo.checkUsernameAvailability).toHaveBeenCalledWith(
      'johndoe',
    );
    expect(result.username).toBe('johndoe');
  });
});
