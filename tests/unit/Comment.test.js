import { describe, it, expect } from 'vitest';
import Comment from '../../src/Domains/comments/entities/Comment.js';

describe('Comment entity', () => {
  it('should throw when missing property', () => {
    expect(() => new Comment({ content: 'hello' })).toThrow(
      'COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw when wrong data type', () => {
    expect(
      () =>
        new Comment({ content: 123, owner: 'user-1', threadId: 'thread-1' }),
    ).toThrow('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create correctly with valid payload', () => {
    const comment = new Comment({
      content: 'hello',
      owner: 'user-1',
      threadId: 'thread-1',
    });
    expect(comment.content).toBe('hello');
    expect(comment.owner).toBe('user-1');
    expect(comment.threadId).toBe('thread-1');
  });
});
