export class Authentication {
  constructor({ accessToken, refreshToken }) {
    this._verify({ accessToken, refreshToken });
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  _verify({ accessToken, refreshToken }) {
    if (!accessToken || !refreshToken) {
      throw new Error('AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
      throw new Error('AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}
