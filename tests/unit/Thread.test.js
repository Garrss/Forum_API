import { describe, it, expect } from 'vitest';
import Thread from '../../src/Domains/threads/entities/Thread.js';

describe('Thread entity', () => {
  it('should throw when missing property', () => {
    expect(() => new Thread({ title: 'Test' })).toThrow(
      'THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw when wrong data type', () => {
    expect(
      () => new Thread({ title: 123, body: 'body', owner: 'user-1' }),
    ).toThrow('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create correctly with valid payload', () => {
    const thread = new Thread({
      title: 'Hello',
      body: 'World',
      owner: 'user-123',
    });
    expect(thread.title).toBe('Hello');
    expect(thread.body).toBe('World');
    expect(thread.owner).toBe('user-123');
  });
});
