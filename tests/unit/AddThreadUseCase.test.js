import { describe, it, expect, vi } from 'vitest';
import { AddThreadUseCase } from '../../src/Applications/use_case/AddThreadUseCase.js';

describe('AddThreadUseCase', () => {
  it('should orchestrate add thread correctly', async () => {
    const mockRepo = {
      addThread: vi
        .fn()
        .mockResolvedValue({
          id: 'thread-123',
          title: 'Test Title',
          owner: 'user-1',
        }),
    };

    const useCase = new AddThreadUseCase({ threadRepository: mockRepo });
    const result = await useCase.execute({
      title: 'Test Title',
      body: 'Body',
      owner: 'user-1',
    });

    expect(mockRepo.addThread).toHaveBeenCalledOnce();
    expect(result.id).toBeDefined();
    expect(result.title).toBe('Test Title');
  });
});
