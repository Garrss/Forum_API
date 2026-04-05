import { describe, it, expect } from 'vitest';
import AuthenticationRepository from '../../src/Domains/authentications/AuthenticationRepository.js';

describe('AuthenticationRepository interface', () => {
  it('should throw NOT_IMPLEMENTED on addToken', async () => {
    const repo = new AuthenticationRepository();
    await expect(repo.addToken('token')).rejects.toThrow(
      'AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on checkTokenAvailability', async () => {
    const repo = new AuthenticationRepository();
    await expect(repo.checkTokenAvailability('token')).rejects.toThrow(
      'AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on deleteToken', async () => {
    const repo = new AuthenticationRepository();
    await expect(repo.deleteToken('token')).rejects.toThrow(
      'AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
