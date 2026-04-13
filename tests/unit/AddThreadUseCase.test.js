import { describe, it, expect, vi } from 'vitest';
import { AddThreadUseCase } from '../../src/Applications/use_case/AddThreadUseCase.js';

describe('AddThreadUseCase', () => {
  it('should orchestrate add thread correctly', async () => {
    const useCasePayload = {
      title: 'Thread Baru',
      body: 'Isi Thread',
      owner: 'user-1',
    };

    const mockRepo = {
      addThread: vi.fn().mockResolvedValue({
        id: 'thread-UNIQUE_ID',
        title: 'DIFFERENT_TITLE',
        owner: 'DIFFERENT_OWNER',
      }),
    };

    const useCase = new AddThreadUseCase({
      threadRepository: mockRepo,
    });

    const result = await useCase.execute(useCasePayload);

    expect(mockRepo.addThread).toHaveBeenCalledWith({
      id: expect.stringMatching(/^thread-/),
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    });

    expect(result.id).toBe('thread-UNIQUE_ID');
  });
});
