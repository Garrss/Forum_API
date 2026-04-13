export class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const commentIds = comments.map((c) => c.id);
    const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);

    let likeCounts = commentIds.map(() => 0);
    if (this._likeRepository) {
      likeCounts = await Promise.all(
        commentIds.map((id) =>
          this._likeRepository.getLikeCountByCommentId(id),
        ),
      );
    }

    const commentsWithReplies = comments.map((comment, index) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
      likeCount: likeCounts[index],
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