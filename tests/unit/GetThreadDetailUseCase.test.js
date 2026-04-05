/* eslint-disable camelcase */
import { describe, it, expect, vi } from 'vitest';
import { GetThreadDetailUseCase } from '../../src/Applications/use_case/GetThreadDetailUseCase.js';

describe('GetThreadDetailUseCase', () => {
  it('should return thread detail with comments and replies correctly', async () => {
    const mockThread = {
      id: 'thread-1',
      title: 'A Thread',
      body: 'A body',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-1',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'a comment',
        is_delete: false,
      },
      {
        id: 'comment-2',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'deleted comment',
        is_delete: true,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-1',
        comment_id: 'comment-1',
        username: 'dicoding',
        date: '2021-08-08T07:59:48.766Z',
        content: 'deleted reply',
        is_delete: true,
      },
      {
        id: 'reply-2',
        comment_id: 'comment-1',
        username: 'johndoe',
        date: '2021-08-08T08:07:01.522Z',
        content: 'a reply',
        is_delete: false,
      },
    ];

    const mockThreadRepo = {
      getThreadById: vi.fn().mockResolvedValue(mockThread),
    };
    const mockCommentRepo = {
      getCommentsByThreadId: vi.fn().mockResolvedValue(mockComments),
    };
    const mockReplyRepo = {
      getRepliesByCommentIds: vi.fn().mockResolvedValue(mockReplies),
    };

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: mockCommentRepo,
      replyRepository: mockReplyRepo,
    });

    const result = await useCase.execute('thread-1');

    expect(mockThreadRepo.getThreadById).toHaveBeenCalledWith('thread-1');
    expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledWith(
      'thread-1',
    );
    expect(mockReplyRepo.getRepliesByCommentIds).toHaveBeenCalledWith([
      'comment-1',
      'comment-2',
    ]);

    expect(result).toEqual({
      ...mockThread,
      comments: [
        {
          id: 'comment-1',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'a comment',
          replies: [
            {
              id: 'reply-1',
              content: '**reply has been deleted**',
              date: '2021-08-08T07:59:48.766Z',
              username: 'dicoding',
            },
            {
              id: 'reply-2',
              content: 'a reply',
              date: '2021-08-08T08:07:01.522Z',
              username: 'johndoe',
            },
          ],
        },
        {
          id: 'comment-2',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**comment has been deleted**',
          replies: [],
        },
      ],
    });
  });

  it('should throw NotFoundError when thread does not exist', async () => {
    const mockThreadRepo = {
      getThreadById: vi.fn().mockRejectedValue(new Error('Thread not found')),
    };

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: { getCommentsByThreadId: vi.fn() },
      replyRepository: { getRepliesByCommentIds: vi.fn() },
    });

    await expect(useCase.execute('thread-xxx')).rejects.toThrow(
      'Thread not found',
    );
  });
});
