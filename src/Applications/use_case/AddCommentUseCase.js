import { nanoid } from 'nanoid';
import Comment from '../../Domains/comments/entities/Comment.js';

export default class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ content, owner, threadId }) {
    await this._threadRepository.checkThreadExists(threadId);
    const comment = new Comment({ content, owner, threadId });
    const id = `comment-${nanoid(16)}`;
    return this._commentRepository.addComment({ id, ...comment });
  }
}