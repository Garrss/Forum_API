export default class Comment {
  constructor({ content, owner, threadId }) {
    this._verify({ content, owner, threadId });
    this.content = content;
    this.owner = owner;
    this.threadId = threadId;
  }

  _verify({ content, owner, threadId }) {
    if (!content || !owner || !threadId) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (typeof content !== 'string') {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPES_SPECIFICATION');
    }
  }
}