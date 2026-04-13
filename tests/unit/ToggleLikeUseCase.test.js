import { describe, it, expect, vi } from 'vitest';
import { ToggleLikeUseCase } from '../../src/Applications/use_case/ToggleLikeUseCase.js';

describe('ToggleLikeUseCase', () => {
  const mockThreadRepo = { checkThreadExists: vi.fn().mockResolvedValue() };
  const mockCommentRepo = { checkCommentExists: vi.fn().mockResolvedValue() };

  it('should like a comment when not yet liked', async () => {
    const mockLikeRepo = {
      checkLikeExists: vi.fn().mockResolvedValue(false),
      addLike: vi.fn().mockResolvedValue(),
      deleteLike: vi.fn(),
    };

    const useCase = new ToggleLikeUseCase({
      likeRepository: mockLikeRepo,
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });

    await useCase.execute({ threadId: 't1', commentId: 'c1', owner: 'user-1' });

    expect(mockLikeRepo.addLike).toHaveBeenCalledOnce();
    expect(mockLikeRepo.deleteLike).not.toHaveBeenCalled();
  });

  it('should unlike a comment when already liked', async () => {
    const mockLikeRepo = {
      checkLikeExists: vi.fn().mockResolvedValue(true),
      addLike: vi.fn(),
      deleteLike: vi.fn().mockResolvedValue(),
    };

    const useCase = new ToggleLikeUseCase({
      likeRepository: mockLikeRepo,
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });

    await useCase.execute({ threadId: 't1', commentId: 'c1', owner: 'user-1' });

    expect(mockLikeRepo.deleteLike).toHaveBeenCalledOnce();
    expect(mockLikeRepo.addLike).not.toHaveBeenCalled();
  });

  it('should throw when thread does not exist', async () => {
    const mockThreadRepoFail = {
      checkThreadExists: vi
        .fn()
        .mockRejectedValue(new Error('Thread tidak ditemukan')),
    };
    const mockLikeRepo = {
      checkLikeExists: vi.fn(),
      addLike: vi.fn(),
      deleteLike: vi.fn(),
    };

    const useCase = new ToggleLikeUseCase({
      likeRepository: mockLikeRepo,
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepoFail,
    });

    await expect(
      useCase.execute({
        threadId: 'bad-thread',
        commentId: 'c1',
        owner: 'user-1',
      }),
    ).rejects.toThrow('Thread tidak ditemukan');
  });

  it('should throw when comment does not exist', async () => {
    const mockCommentRepoFail = {
      checkCommentExists: vi
        .fn()
        .mockRejectedValue(new Error('Comment tidak ditemukan')),
    };
    const mockLikeRepo = {
      checkLikeExists: vi.fn(),
      addLike: vi.fn(),
      deleteLike: vi.fn(),
    };

    const useCase = new ToggleLikeUseCase({
      likeRepository: mockLikeRepo,
      commentRepository: mockCommentRepoFail,
      threadRepository: mockThreadRepo,
    });

    await expect(
      useCase.execute({
        threadId: 't1',
        commentId: 'bad-comment',
        owner: 'user-1',
      }),
    ).rejects.toThrow('Comment tidak ditemukan');
  });
});
