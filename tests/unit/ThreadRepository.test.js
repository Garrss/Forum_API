import { describe, it, expect } from 'vitest';
import ThreadRepository from '../../src/Domains/threads/ThreadRepository.js';

describe('ThreadRepository interface', () => {
  it('should throw NOT_IMPLEMENTED on addThread', async () => {
    const repo = new ThreadRepository();
    await expect(repo.addThread({})).rejects.toThrow(
      'THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on checkThreadExists', async () => {
    const repo = new ThreadRepository();
    await expect(repo.checkThreadExists('thread-1')).rejects.toThrow(
      'THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on getThreadById', async () => {
    const repo = new ThreadRepository();
    await expect(repo.getThreadById('thread-1')).rejects.toThrow(
      'THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
