import jwt from 'jsonwebtoken';
import InvariantError from '../../Commons/exceptions/InvariantError.js';

export class RefreshAuthenticationUseCase {
  constructor({ authenticationRepository }) {
    this._authenticationRepository = authenticationRepository;
  }

  async execute({ refreshToken }) {
    await this._authenticationRepository.checkTokenAvailability(refreshToken);

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
    } catch {
      throw new InvariantError('Refresh token is invalid');
    }

    const { id, username } = decoded;
    const accessToken = jwt.sign(
      { id, username },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: Number(process.env.ACCESS_TOKEN_AGE) },
    );

    return { accessToken };
  }
}
