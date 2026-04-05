import { describe, it, expect, vi } from 'vitest';
import { DeleteCommentUseCase } from '../../src/Applications/use_case/DeleteCommentUseCase.js';
import AuthorizationError from '../../src/Commons/exceptions/AuthorizationError.js';

describe('DeleteCommentUseCase', () => {
  it('should throw AuthorizationError when not the owner', async () => {
    const mockThreadRepo = { checkThreadExists: vi.fn().mockResolvedValue() };
    const mockCommentRepo = {
      checkCommentExists: vi.fn().mockResolvedValue(),
      verifyCommentOwner: vi
        .fn()
        .mockRejectedValue(new AuthorizationError('Not authorized')),
      deleteComment: vi.fn(),
    };

    const useCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });
    await expect(
      useCase.execute({ commentId: 'c1', threadId: 't1', owner: 'wrong-user' }),
    ).rejects.toThrow(AuthorizationError);
    expect(mockCommentRepo.deleteComment).not.toHaveBeenCalled();
  });

  it('should delete comment when owner is correct', async () => {
    const mockThreadRepo = { checkThreadExists: vi.fn().mockResolvedValue() };
    const mockCommentRepo = {
      checkCommentExists: vi.fn().mockResolvedValue(),
      verifyCommentOwner: vi.fn().mockResolvedValue(),
      deleteComment: vi.fn().mockResolvedValue(),
    };

    const useCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });
    await useCase.execute({ commentId: 'c1', threadId: 't1', owner: 'user-1' });
    expect(mockCommentRepo.deleteComment).toHaveBeenCalledWith('c1');
  });
});
