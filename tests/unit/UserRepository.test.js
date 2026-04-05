import { describe, it, expect } from 'vitest';
import UserRepository from '../../src/Domains/users/UserRepository.js';

describe('UserRepository interface', () => {
  it('should throw NOT_IMPLEMENTED on checkUsernameAvailability', async () => {
    const repo = new UserRepository();
    await expect(repo.checkUsernameAvailability('user')).rejects.toThrow(
      'USER_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on addUser', async () => {
    const repo = new UserRepository();
    await expect(repo.addUser({})).rejects.toThrow(
      'USER_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on getUserByUsername', async () => {
    const repo = new UserRepository();
    await expect(repo.getUserByUsername('user')).rejects.toThrow(
      'USER_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on getUserById', async () => {
    const repo = new UserRepository();
    await expect(repo.getUserById('user-1')).rejects.toThrow(
      'USER_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
