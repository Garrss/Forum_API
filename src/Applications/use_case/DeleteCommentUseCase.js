export default class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ commentId, threadId, owner }) {
    await this._threadRepository.checkThreadExists(threadId);
    await this._commentRepository.checkCommentExists(commentId);
    await this._commentRepository.verifyCommentOwner({ commentId, owner });
    await this._commentRepository.deleteComment(commentId);
  }
}