import jwt from 'jsonwebtoken';

export class RefreshAuthenticationUseCase {
  constructor({ authenticationRepository }) {
    this._authenticationRepository = authenticationRepository;
  }

  async execute({ refreshToken }) {
    await this._authenticationRepository.checkTokenAvailability(refreshToken);
    const { id, username } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
    const accessToken = jwt.sign(
      { id, username },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: Number(process.env.ACCESS_TOKEN_AGE) }
    );
    return { accessToken };
  }
}