export class DeleteReplyUseCase {
    constructor({ replyRepository, commentRepository, threadRepository }) {
        this._replyRepository = replyRepository;
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute({ replyId, commentId, threadId, owner }) {
        await this._threadRepository.checkThreadExists(threadId);
        await this._commentRepository.checkCommentExists(commentId);
        await this._replyRepository.checkReplyExists(replyId);
        await this._replyRepository.verifyReplyOwner({ replyId, owner });
        await this._replyRepository.deleteReply(replyId);
    }
}