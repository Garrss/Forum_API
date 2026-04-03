import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Authentication } from '../../Domains/authentications/entities/Authentication.js';
import { AuthenticationError } from '../../Commons/exceptions/AuthenticationError.js';

export class LoginUserUseCase {
  constructor({ userRepository, authenticationRepository }) {
    this._userRepository = userRepository;
    this._authenticationRepository = authenticationRepository;
  }

  async execute({ username, password }) {
    const user = await this._userRepository.getUserByUsername(username);

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new AuthenticationError('Wrong password');

    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: Number(process.env.ACCESS_TOKEN_AGE) },
    );
    const refreshToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.REFRESH_TOKEN_KEY,
    );

    // Validate tokens through entity before persisting
    const authentication = new Authentication({ accessToken, refreshToken });

    await this._authenticationRepository.addToken(authentication.refreshToken);
    return authentication;
  }
}
