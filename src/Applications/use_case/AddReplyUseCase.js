import { Reply } from '../../Domains/replies/entities/Reply.js';
import { nanoid } from 'nanoid';

export class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ content, owner, commentId, threadId }) {
    await this._threadRepository.checkThreadExists(threadId);
    await this._commentRepository.checkCommentExists(commentId);
    const reply = new Reply({ content, owner, commentId, threadId });
    const id = `reply-${nanoid(16)}`;
    return this._replyRepository.addReply({ id, ...reply });
  }
}