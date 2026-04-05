import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Authentication from '../../Domains/authentications/entities/Authentication.js';
import AuthenticationError from '../../Commons/exceptions/AuthenticationError.js';
import InvariantError from '../../Commons/exceptions/InvariantError.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';

export class LoginUserUseCase {
  constructor({ userRepository, authenticationRepository }) {
    this._userRepository = userRepository;
    this._authenticationRepository = authenticationRepository;
  }

  async execute({ username, password }) {
    if (!username || !password) {
      throw new InvariantError(
        'tidak dapat membuat authentication karena properti yang dibutuhkan tidak ada',
      );
    }

    let user;
    try {
      user = await this._userRepository.getUserByUsername(username);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new InvariantError('kredensial yang Anda berikan salah');
      }
      throw error;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new AuthenticationError('kredensial yang Anda berikan salah');
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: Number(process.env.ACCESS_TOKEN_AGE) || 3000 },
    );

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.REFRESH_TOKEN_KEY,
    );

    const authentication = new Authentication({ accessToken, refreshToken });
    await this._authenticationRepository.addToken(authentication.refreshToken);
    return authentication;
  }
}
