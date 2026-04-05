import { describe, it, expect } from 'vitest';
import User from '../../src/Domains/users/entities/User.js';

describe('User entity', () => {
  it('should throw when missing property', () => {
    expect(() => new User({ username: 'john', password: 'secret' })).toThrow(
      'USER.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw when wrong data type', () => {
    expect(
      () => new User({ username: 123, password: 'secret', fullname: 'John' }),
    ).toThrow('USER.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw when username exceeds 50 chars', () => {
    expect(
      () =>
        new User({
          username: 'a'.repeat(51),
          password: 'secret',
          fullname: 'John',
        }),
    ).toThrow('USER.USERNAME_LIMIT_CHAR');
  });

  it('should throw when username contains restricted characters', () => {
    expect(
      () =>
        new User({
          username: 'john doe',
          password: 'secret',
          fullname: 'John',
        }),
    ).toThrow('USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER');
  });

  it('should create correctly with valid payload', () => {
    const user = new User({
      username: 'john_doe',
      password: 'secret123',
      fullname: 'John Doe',
    });
    expect(user.username).toBe('john_doe');
    expect(user.fullname).toBe('John Doe');
  });
});
