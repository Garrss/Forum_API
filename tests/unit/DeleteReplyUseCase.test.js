import { describe, it, expect, vi } from 'vitest';
import { DeleteReplyUseCase } from '../../src/Applications/use_case/DeleteReplyUseCase.js';
import AuthorizationError from '../../src/Commons/exceptions/AuthorizationError.js';

describe('DeleteReplyUseCase', () => {
  it('should throw when thread does not exist', async () => {
    const mockThreadRepo = {
      checkThreadExists: vi
        .fn()
        .mockRejectedValue(new Error('Thread not found')),
    };
    const mockCommentRepo = { checkCommentExists: vi.fn() };
    const mockReplyRepo = {
      checkReplyExists: vi.fn(),
      verifyReplyOwner: vi.fn(),
      deleteReply: vi.fn(),
    };

    const useCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepo,
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });

    await expect(
      useCase.execute({
        replyId: 'reply-1',
        commentId: 'comment-1',
        threadId: 'bad-thread',
        owner: 'user-1',
      }),
    ).rejects.toThrow('Thread not found');

    expect(mockThreadRepo.checkThreadExists).toHaveBeenCalledWith('bad-thread');

    expect(mockCommentRepo.checkCommentExists).not.toHaveBeenCalled();
    expect(mockReplyRepo.checkReplyExists).not.toHaveBeenCalled();
    expect(mockReplyRepo.verifyReplyOwner).not.toHaveBeenCalled();
    expect(mockReplyRepo.deleteReply).not.toHaveBeenCalled();
  });

  it('should throw when comment does not exist', async () => {
    const mockThreadRepo = { checkThreadExists: vi.fn().mockResolvedValue() };
    const mockCommentRepo = {
      checkCommentExists: vi
        .fn()
        .mockRejectedValue(new Error('Comment not found')),
    };
    const mockReplyRepo = {
      checkReplyExists: vi.fn(),
      verifyReplyOwner: vi.fn(),
      deleteReply: vi.fn(),
    };

    const useCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepo,
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });

    await expect(
      useCase.execute({
        replyId: 'reply-1',
        commentId: 'bad-comment',
        threadId: 'thread-1',
        owner: 'user-1',
      }),
    ).rejects.toThrow('Comment not found');

    expect(mockThreadRepo.checkThreadExists).toHaveBeenCalledWith('thread-1');
    expect(mockCommentRepo.checkCommentExists).toHaveBeenCalledWith(
      'bad-comment',
    );

    expect(mockReplyRepo.checkReplyExists).not.toHaveBeenCalled();
    expect(mockReplyRepo.verifyReplyOwner).not.toHaveBeenCalled();
    expect(mockReplyRepo.deleteReply).not.toHaveBeenCalled();
  });

  it('should throw AuthorizationError when not the owner', async () => {
    const mockThreadRepo = { checkThreadExists: vi.fn().mockResolvedValue() };
    const mockCommentRepo = { checkCommentExists: vi.fn().mockResolvedValue() };
    const mockReplyRepo = {
      checkReplyExists: vi.fn().mockResolvedValue(),
      verifyReplyOwner: vi
        .fn()
        .mockRejectedValue(new AuthorizationError('Not authorized')),
      deleteReply: vi.fn(),
    };

    const useCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepo,
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });

    await expect(
      useCase.execute({
        replyId: 'reply-1',
        commentId: 'comment-1',
        threadId: 'thread-1',
        owner: 'wrong-user',
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(mockThreadRepo.checkThreadExists).toHaveBeenCalledWith('thread-1');
    expect(mockCommentRepo.checkCommentExists).toHaveBeenCalledWith(
      'comment-1',
    );
    expect(mockReplyRepo.checkReplyExists).toHaveBeenCalledWith('reply-1');
    expect(mockReplyRepo.verifyReplyOwner).toHaveBeenCalledWith({
      replyId: 'reply-1',
      owner: 'wrong-user',
    });

    expect(mockReplyRepo.deleteReply).not.toHaveBeenCalled();
  });

  it('should delete reply when owner is correct', async () => {
    const mockThreadRepo = { checkThreadExists: vi.fn().mockResolvedValue() };
    const mockCommentRepo = { checkCommentExists: vi.fn().mockResolvedValue() };
    const mockReplyRepo = {
      checkReplyExists: vi.fn().mockResolvedValue(),
      verifyReplyOwner: vi.fn().mockResolvedValue(),
      deleteReply: vi.fn().mockResolvedValue(),
    };

    const useCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepo,
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });

    await useCase.execute({
      replyId: 'reply-1',
      commentId: 'comment-1',
      threadId: 'thread-1',
      owner: 'user-1',
    });

    expect(mockThreadRepo.checkThreadExists).toHaveBeenCalledWith('thread-1');
    expect(mockCommentRepo.checkCommentExists).toHaveBeenCalledWith(
      'comment-1',
    );
    expect(mockReplyRepo.checkReplyExists).toHaveBeenCalledWith('reply-1');
    expect(mockReplyRepo.verifyReplyOwner).toHaveBeenCalledWith({
      replyId: 'reply-1',
      owner: 'user-1',
    });

    expect(mockReplyRepo.deleteReply).toHaveBeenCalledWith('reply-1');
  });
});
