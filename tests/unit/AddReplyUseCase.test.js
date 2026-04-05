import { describe, it, expect, vi } from 'vitest';
import { AddReplyUseCase } from '../../src/Applications/use_case/AddReplyUseCase.js';

describe('AddReplyUseCase', () => {
  it('should throw when thread does not exist', async () => {
    const mockThreadRepo = {
      checkThreadExists: vi
        .fn()
        .mockRejectedValue(new Error('Thread not found')),
    };
    const mockCommentRepo = { checkCommentExists: vi.fn() };
    const mockReplyRepo = { addReply: vi.fn() };

    const useCase = new AddReplyUseCase({
      replyRepository: mockReplyRepo,
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });
    await expect(
      useCase.execute({
        content: 'a reply',
        owner: 'user-1',
        commentId: 'comment-1',
        threadId: 'bad-thread',
      }),
    ).rejects.toThrow('Thread not found');
    expect(mockReplyRepo.addReply).not.toHaveBeenCalled();
  });

  it('should throw when comment does not exist', async () => {
    const mockThreadRepo = { checkThreadExists: vi.fn().mockResolvedValue() };
    const mockCommentRepo = {
      checkCommentExists: vi
        .fn()
        .mockRejectedValue(new Error('Comment not found')),
    };
    const mockReplyRepo = { addReply: vi.fn() };

    const useCase = new AddReplyUseCase({
      replyRepository: mockReplyRepo,
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });
    await expect(
      useCase.execute({
        content: 'a reply',
        owner: 'user-1',
        commentId: 'bad-comment',
        threadId: 'thread-1',
      }),
    ).rejects.toThrow('Comment not found');
    expect(mockReplyRepo.addReply).not.toHaveBeenCalled();
  });

  it('should add reply correctly when thread and comment exist', async () => {
    const mockThreadRepo = { checkThreadExists: vi.fn().mockResolvedValue() };
    const mockCommentRepo = { checkCommentExists: vi.fn().mockResolvedValue() };
    const mockReplyRepo = {
      addReply: vi
        .fn()
        .mockResolvedValue({
          id: 'reply-1',
          content: 'a reply',
          owner: 'user-1',
        }),
    };

    const useCase = new AddReplyUseCase({
      replyRepository: mockReplyRepo,
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });
    const result = await useCase.execute({
      content: 'a reply',
      owner: 'user-1',
      commentId: 'comment-1',
      threadId: 'thread-1',
    });

    expect(mockReplyRepo.addReply).toHaveBeenCalledOnce();
    expect(result.content).toBe('a reply');
  });
});
