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

    expect(mockThreadRepo.checkThreadExists).toHaveBeenCalledWith('bad-thread');

    expect(mockCommentRepo.checkCommentExists).not.toHaveBeenCalled();
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

    expect(mockThreadRepo.checkThreadExists).toHaveBeenCalledWith('thread-1');

    expect(mockCommentRepo.checkCommentExists).toHaveBeenCalledWith(
      'bad-comment',
    );

    expect(mockReplyRepo.addReply).not.toHaveBeenCalled();
  });

  it('should add reply correctly when thread and comment exist', async () => {
    const mockThreadRepo = { checkThreadExists: vi.fn().mockResolvedValue() };
    const mockCommentRepo = { checkCommentExists: vi.fn().mockResolvedValue() };

    const mockReplyRepo = {
      addReply: vi.fn().mockResolvedValue({
        id: 'reply-UNIQUE_ID',
        content: 'a reply',
        owner: 'user-1',
      }),
    };

    const useCase = new AddReplyUseCase({
      replyRepository: mockReplyRepo,
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });

    const payload = {
      content: 'a reply',
      owner: 'user-1',
      commentId: 'comment-1',
      threadId: 'thread-1',
    };

    const result = await useCase.execute(payload);

    expect(mockThreadRepo.checkThreadExists).toHaveBeenCalledWith('thread-1');
    expect(mockCommentRepo.checkCommentExists).toHaveBeenCalledWith(
      'comment-1',
    );
    expect(mockReplyRepo.addReply).toHaveBeenCalled();

    const calledArg = mockReplyRepo.addReply.mock.calls[0][0];
    expect(calledArg).toMatchObject({
      content: payload.content,
      owner: payload.owner,
      commentId: payload.commentId,
      threadId: payload.threadId,
    });
    expect(calledArg.id).toMatch(/^reply-/);

    expect(result.id).toBe('reply-UNIQUE_ID');
  });
});
