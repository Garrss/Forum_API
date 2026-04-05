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
    expect(mockCommentRepo.addComment).not.toHaveBeenCalled();
  });

  it('should add comment when thread exists', async () => {
    const mockThreadRepo = { checkThreadExists: vi.fn().mockResolvedValue() };
    const mockCommentRepo = {
      addComment: vi
        .fn()
        .mockResolvedValue({ id: 'comment-1', content: 'hi', owner: 'u1' }),
    };

    const useCase = new AddCommentUseCase({
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });
    const result = await useCase.execute({
      content: 'hi',
      owner: 'u1',
      threadId: 'thread-1',
    });
    expect(result.content).toBe('hi');
  });
});
