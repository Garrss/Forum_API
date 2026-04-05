import { describe, it, expect } from 'vitest';
import Authentication from '../../src/Domains/authentications/entities/Authentication.js';

describe('Authentication entity', () => {
  it('should throw when missing property', () => {
    expect(() => new Authentication({ accessToken: 'access-token' })).toThrow(
      'AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw when wrong data type', () => {
    expect(
      () =>
        new Authentication({ accessToken: 123, refreshToken: 'refresh-token' }),
    ).toThrow('AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create correctly with valid payload', () => {
    const auth = new Authentication({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(auth.accessToken).toBe('access-token');
    expect(auth.refreshToken).toBe('refresh-token');
  });
});
