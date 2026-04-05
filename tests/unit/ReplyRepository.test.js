import { describe, it, expect } from 'vitest';
import ReplyRepository from '../../src/Domains/replies/ReplyRepository.js';

describe('ReplyRepository interface', () => {
  it('should throw NOT_IMPLEMENTED on addReply', async () => {
    const repo = new ReplyRepository();
    await expect(repo.addReply({})).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on checkReplyExists', async () => {
    const repo = new ReplyRepository();
    await expect(repo.checkReplyExists('reply-1')).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on verifyReplyOwner', async () => {
    const repo = new ReplyRepository();
    await expect(
      repo.verifyReplyOwner({ replyId: 'r1', owner: 'u1' }),
    ).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw NOT_IMPLEMENTED on deleteReply', async () => {
    const repo = new ReplyRepository();
    await expect(repo.deleteReply('reply-1')).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });

  it('should throw NOT_IMPLEMENTED on getRepliesByCommentIds', async () => {
    const repo = new ReplyRepository();
    await expect(repo.getRepliesByCommentIds([])).rejects.toThrow(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
