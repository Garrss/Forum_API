import jwt from 'jsonwebtoken';
import InvariantError from '../../Commons/exceptions/InvariantError.js';

export class RefreshAuthenticationUseCase {
  constructor({ authenticationRepository }) {
    this._authenticationRepository = authenticationRepository;
  }

  async execute({ refreshToken }) {
    if (!refreshToken) {
      throw new InvariantError(
        'tidak dapat memperbarui authentication karena properti yang dibutuhkan tidak ada',
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
    } catch {
      throw new InvariantError('refresh token tidak valid');
    }

    await this._authenticationRepository.checkTokenAvailability(refreshToken);

    const accessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: Number(process.env.ACCESS_TOKEN_AGE) || 3000 },
    );

    return { accessToken };
  }
}
