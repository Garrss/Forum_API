import { describe, it, expect, vi } from 'vitest';
import { AddCommentUseCase } from '../../src/Applications/use_case/AddCommentUseCase.js';

describe('AddCommentUseCase', () => {
  it('should throw when thread does not exist', async () => {
    const mockThreadRepo = {
      checkThreadExists: vi
        .fn()
        .mockRejectedValue(new Error('Thread not found')),
    };

    const mockCommentRepo = { addComment: vi.fn() };

    const useCase = new AddCommentUseCase({
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });

    await expect(
      useCase.execute({ content: 'hi', owner: 'u1', threadId: 'bad-id' }),
    ).rejects.toThrow('Thread not found');

    expect(mockThreadRepo.checkThreadExists).toHaveBeenCalledWith('bad-id');

    expect(mockCommentRepo.addComment).not.toHaveBeenCalled();
  });

  it('should add comment when thread exists', async () => {
    const mockThreadRepo = {
      checkThreadExists: vi.fn().mockResolvedValue(),
    };

    const mockCommentRepo = {
      addComment: vi.fn().mockResolvedValue({
        id: 'comment-REALLY_NEW_ID',
        content: 'hi',
        owner: 'u1',
      }),
    };

    const useCase = new AddCommentUseCase({
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });

    const useCasePayload = {
      content: 'hi',
      owner: 'u1',
      threadId: 'thread-1',
    };

    const result = await useCase.execute(useCasePayload);

    expect(result).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^comment-/),
        content: 'hi',
        owner: 'u1',
      }),
    );

    expect(mockThreadRepo.checkThreadExists).toHaveBeenCalledWith('thread-1');
    expect(mockCommentRepo.addComment).toHaveBeenCalledTimes(1);

    const calledArg = mockCommentRepo.addComment.mock.calls[0][0];

    expect(calledArg).toMatchObject({
      content: 'hi',
      owner: 'u1',
      threadId: 'thread-1',
    });

    expect(calledArg.id).toMatch(/^comment-/);
  });
});
