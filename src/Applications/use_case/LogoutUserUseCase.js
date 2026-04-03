export class LogoutUserUseCase {
  constructor({ authenticationRepository }) {
    this._authenticationRepository = authenticationRepository;
  }

  async execute({ refreshToken }) {
    await this._authenticationRepository.checkTokenAvailability(refreshToken);
    await this._authenticationRepository.deleteToken(refreshToken);
  }
}