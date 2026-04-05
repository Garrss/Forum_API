export class Reply {
  constructor({ content, owner, commentId, threadId }) {
    this._verify({ content, owner, commentId, threadId });
    this.content = content;
    this.owner = owner;
    this.commentId = commentId;
    this.threadId = threadId;
  }

  _verify({ content, owner, commentId, threadId }) {
    if (!content || !owner || !commentId || !threadId) {
      throw new Error('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (typeof content !== 'string') {
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default Reply;
