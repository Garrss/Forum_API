export default class Reply {
  constructor({ content, owner, commentId }) {
    this._verify({ content, owner, commentId });
    this.content = content;
    this.owner = owner;
    this.commentsId = commentId;
  }

  _verify({ content, owner, commentId }) {
    if (!content || !owner || !commentId) {
      throw new Error('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (typeof content !== 'string') {
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}