import { describe, it, expect } from 'vitest';
import Reply from '../../src/Domains/replies/entities/Reply.js';

describe('Reply entity', () => {
  it('should throw when missing property', () => {
    expect(() => new Reply({ content: 'hello' })).toThrow(
      'REPLY.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw when wrong data type', () => {
    expect(
      () =>
        new Reply({
          content: 123,
          owner: 'user-1',
          commentId: 'comment-1',
          threadId: 'thread-1',
        }),
    ).toThrow('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create correctly with valid payload', () => {
    const reply = new Reply({
      content: 'hello',
      owner: 'user-1',
      commentId: 'comment-1',
      threadId: 'thread-1',
    });
    expect(reply.content).toBe('hello');
    expect(reply.commentId).toBe('comment-1');
  });
});
