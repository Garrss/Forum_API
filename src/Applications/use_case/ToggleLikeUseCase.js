import { nanoid } from 'nanoid';

export class ToggleLikeUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ threadId, commentId, owner }) {
    await this._threadRepository.checkThreadExists(threadId);
    await this._commentRepository.checkCommentExists(commentId);

    const isLiked = await this._likeRepository.checkLikeExists({
      commentId,
      owner,
    });

    if (isLiked) {
      await this._likeRepository.deleteLike({ commentId, owner });
    } else {
      const id = `like-${nanoid(16)}`;
      await this._likeRepository.addLike({ id, commentId, owner });
    }
  }
}
