import { describe, it, expect } from 'vitest';
import CommentRepository from '../../src/Domains/comments/CommentRepository.js';

describe('CommentRepository interface', () => {
  it('should throw NOT_IMPLEMENTED on addComment', async () => {
    const repo = new CommentRepository();
    await expect(repo.addComment({})).rejects.toThrow(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on checkCommentExists', async () => {
    const repo = new CommentRepository();
    await expect(repo.checkCommentExists('comment-1')).rejects.toThrow(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on verifyCommentOwner', async () => {
    const repo = new CommentRepository();
    await expect(
      repo.verifyCommentOwner({ commentId: 'c1', owner: 'u1' }),
    ).rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw NOT_IMPLEMENTED on deleteComment', async () => {
    const repo = new CommentRepository();
    await expect(repo.deleteComment('comment-1')).rejects.toThrow(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on getCommentsByThreadId', async () => {
    const repo = new CommentRepository();
    await expect(repo.getCommentsByThreadId('thread-1')).rejects.toThrow(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
