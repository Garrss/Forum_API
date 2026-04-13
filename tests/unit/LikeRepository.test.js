import { describe, it, expect } from 'vitest';
import { LikeRepository } from '../../src/Domains/likes/LikeRepository.js';

describe('LikeRepository interface', () => {
  it('should throw NOT_IMPLEMENTED on addLike', async () => {
    const repo = new LikeRepository();
    await expect(repo.addLike({})).rejects.toThrow(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on deleteLike', async () => {
    const repo = new LikeRepository();
    await expect(repo.deleteLike({})).rejects.toThrow(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on checkLikeExists', async () => {
    const repo = new LikeRepository();
    await expect(repo.checkLikeExists({})).rejects.toThrow(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on getLikeCountByCommentId', async () => {
    const repo = new LikeRepository();
    await expect(repo.getLikeCountByCommentId('comment-1')).rejects.toThrow(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
