export class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const commentIds = comments.map((c) => c.id);
    const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);

    const commentsWithReplies = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
      replies: replies
        .filter((r) => r.comment_id === comment.id)
        .map((r) => ({
          id: r.id,
          content: r.is_delete ? '**balasan telah dihapus**' : r.content,
          date: r.date,
          username: r.username,
        })),
    }));

    return { ...thread, comments: commentsWithReplies };
  }
}