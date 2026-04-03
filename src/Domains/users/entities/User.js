export class User {
  constructor({ username, password, fullname }) {
    this._verify({ username, password, fullname });
    this.username = username;
    this.password = password;
    this.fullname = fullname;
  }

  _verify({ username, password, fullname }) {
    if (!username || !password || !fullname) {
      throw new Error('USER.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      typeof fullname !== 'string'
    ) {
      throw new Error('USER.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
    if (username.length > 50) {
      throw new Error('USER.USERNAME_LIMIT_CHAR');
    }
    if (!/^[\w]+$/.test(username)) {
      throw new Error('USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER');
    }
  }
}
