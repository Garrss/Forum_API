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

    expect(mockUserRepo.checkUsernameAvailability).toHaveBeenCalledWith(
      'taken',
    );
    expect(mockUserRepo.addUser).not.toHaveBeenCalled();
  });

  it('should register user correctly', async () => {
    const mockUserRepo = {
      checkUsernameAvailability: vi.fn().mockResolvedValue(),
      addUser: vi.fn().mockResolvedValue({
        id: 'user-GENERATE_BY_REPO',
        username: 'DIFFERENT_USERNAME',
        fullname: 'DIFFERENT_NAME',
      }),
    };

    const useCase = new RegisterUserUseCase({
      userRepository: mockUserRepo,
    });

    const useCasePayload = {
      username: 'johndoe',
      password: 'secret123',
      fullname: 'John Doe',
    };

    await useCase.execute(useCasePayload);

    expect(mockUserRepo.checkUsernameAvailability).toHaveBeenCalledWith(
      'johndoe',
    );

    expect(mockUserRepo.addUser).toHaveBeenCalled();

    const calledArg = mockUserRepo.addUser.mock.calls[0][0];

    expect(calledArg).toMatchObject({
      username: useCasePayload.username,
      fullname: useCasePayload.fullname,
    });

    expect(calledArg.id).toMatch(/^user-/);

    expect(calledArg.password).not.toBe(useCasePayload.password);
    expect(calledArg.password.length).toBeGreaterThan(10);
  });

  it('should not use raw password when calling addUser', async () => {
    const mockUserRepo = {
      checkUsernameAvailability: vi.fn().mockResolvedValue(),
      addUser: vi.fn().mockResolvedValue({}),
    };

    const useCase = new RegisterUserUseCase({ userRepository: mockUserRepo });

    await useCase.execute({
      username: 'johndoe',
      password: 'secret123',
      fullname: 'John Doe',
    });

    const calledArg = mockUserRepo.addUser.mock.calls[0][0];

    expect(calledArg.password).not.toBe('secret123');
  });
});
