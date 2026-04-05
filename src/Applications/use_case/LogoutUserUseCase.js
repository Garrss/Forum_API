import InvariantError from '../../Commons/exceptions/InvariantError.js';

export class LogoutUserUseCase {
  constructor({ authenticationRepository }) {
    this._authenticationRepository = authenticationRepository;
  }

  async execute({ refreshToken }) {
    if (!refreshToken) {
      throw new InvariantError('tidak dapat menghapus authentication karena properti yang dibutuhkan tidak ada');
    }

    await this._authenticationRepository.checkTokenAvailability(refreshToken);
    await this._authenticationRepository.deleteToken(refreshToken);
  }
}