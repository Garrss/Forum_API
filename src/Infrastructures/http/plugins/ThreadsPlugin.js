import { AddThreadUseCase } from '../../../Applications/use_case/AddThreadUseCase.js';
import { GetThreadDetailUseCase } from '../../../Applications/use_case/GetThreadDetailUseCase.js';
import { AddCommentUseCase } from '../../../Applications/use_case/AddCommentUseCase.js';
import { DeleteCommentUseCase } from '../../../Applications/use_case/DeleteCommentUseCase.js';
import { AddReplyUseCase } from '../../../Applications/use_case/AddReplyUseCase.js';
import { DeleteReplyUseCase } from '../../../Applications/use_case/DeleteReplyUseCase.js';
import { ToggleLikeUseCase } from '../../../Applications/use_case/ToggleLikeUseCase.js';

const requireAuth = (req, res, next) => {
  if (!req.auth)
    return res.status(401).json({ status: 'fail', message: 'Missing authentication' });
  return next();
};

export const ThreadsPlugin = (app, container) => {
  // Threads
  app.post('/threads', requireAuth, async (req, res, next) => {
    try {
      const useCase = new AddThreadUseCase({
        threadRepository: container.threadRepository,
      });
      const addedThread = await useCase.execute({
        ...req.body,
        owner: req.auth.id,
      });
      res.status(201).json({ status: 'success', data: { addedThread } });
    } catch (e) {
      next(e);
    }
  });

  app.get('/threads/:threadId', async (req, res, next) => {
    try {
      const useCase = new GetThreadDetailUseCase({
        threadRepository: container.threadRepository,
        commentRepository: container.commentRepository,
        replyRepository: container.replyRepository,
        likeRepository: container.likeRepository,
      });
      const thread = await useCase.execute(req.params.threadId);
      res.json({ status: 'success', data: { thread } });
    } catch (e) {
      next(e);
    }
  });

  // Comments
  app.post(
    '/threads/:threadId/comments',
    requireAuth,
    async (req, res, next) => {
      try {
        const useCase = new AddCommentUseCase({
          commentRepository: container.commentRepository,
          threadRepository: container.threadRepository,
        });
        const addedComment = await useCase.execute({
          ...req.body,
          threadId: req.params.threadId,
          owner: req.auth.id,
        });
        res.status(201).json({ status: 'success', data: { addedComment } });
      } catch (e) {
        next(e);
      }
    },
  );

  app.delete(
    '/threads/:threadId/comments/:commentId',
    requireAuth,
    async (req, res, next) => {
      try {
        const useCase = new DeleteCommentUseCase({
          commentRepository: container.commentRepository,
          threadRepository: container.threadRepository,
        });
        await useCase.execute({
          commentId: req.params.commentId,
          threadId: req.params.threadId,
          owner: req.auth.id,
        });
        res.json({ status: 'success' });
      } catch (e) {
        next(e);
      }
    },
  );

  // Likes - toggle like/unlike
  app.put(
    '/threads/:threadId/comments/:commentId/likes',
    requireAuth,
    async (req, res, next) => {
      try {
        const useCase = new ToggleLikeUseCase({
          likeRepository: container.likeRepository,
          commentRepository: container.commentRepository,
          threadRepository: container.threadRepository,
        });
        await useCase.execute({
          threadId: req.params.threadId,
          commentId: req.params.commentId,
          owner: req.auth.id,
        });
        res.json({ status: 'success' });
      } catch (e) {
        next(e);
      }
    },
  );

  // Replies
  app.post(
    '/threads/:threadId/comments/:commentId/replies',
    requireAuth,
    async (req, res, next) => {
      try {
        const useCase = new AddReplyUseCase({
          replyRepository: container.replyRepository,
          commentRepository: container.commentRepository,
          threadRepository: container.threadRepository,
        });
        const addedReply = await useCase.execute({
          ...req.body,
          commentId: req.params.commentId,
          threadId: req.params.threadId,
          owner: req.auth.id,
        });
        res.status(201).json({ status: 'success', data: { addedReply } });
      } catch (e) {
        next(e);
      }
    },
  );

  app.delete(
    '/threads/:threadId/comments/:commentId/replies/:replyId',
    requireAuth,
    async (req, res, next) => {
      try {
        const useCase = new DeleteReplyUseCase({
          replyRepository: container.replyRepository,
          commentRepository: container.commentRepository,
          threadRepository: container.threadRepository,
        });
        await useCase.execute({
          replyId: req.params.replyId,
          commentId: req.params.commentId,
          threadId: req.params.threadId,
          owner: req.auth.id,
        });
        res.json({ status: 'success' });
      } catch (e) {
        next(e);
      }
    },
  );
};
