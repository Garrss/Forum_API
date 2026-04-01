export default class Thread {
  constructor({ title, body, owner }) {
    this._verifyPayload({ title, body, owner });
    this.title = title;
    this.body = body;
    this.owner = owner;
  }

  _verifyPayload({ title, body, owner }) {
    if (!title || !body || !owner) {
      throw new Error('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (typeof title !== 'string' || typeof body !== 'string') {
      throw new Error('THREAD.NOT_MEET_DATA_TYPES_SPECIFICATION');
    }
  }
}