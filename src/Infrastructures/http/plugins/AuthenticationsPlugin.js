import { LoginUserUseCase } from '../../../Applications/use_case/LoginUserUseCase.js';
import { LogoutUserUseCase } from '../../../Applications/use_case/LogoutUserUseCase.js';
import { RefreshAuthenticationUseCase } from '../../../Applications/use_case/RefreshAuthenticationUseCase.js';
import InvariantError from '../../../Commons/exceptions/InvariantError.js';

export const AuthenticationsPlugin = (app, container) => {
  // Login
  app.post('/authentications', async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        throw new InvariantError('Username and password are required');
      }
      const useCase = new LoginUserUseCase({
        userRepository: container.userRepository,
        authenticationRepository: container.authenticationRepository,
      });
      const tokens = await useCase.execute({ username, password });
      res.status(201).json({ status: 'success', data: tokens });
    } catch (e) {
      next(e);
    }
  });

  // Refresh token
  app.put('/authentications', async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new InvariantError('Refresh token is required');
      const useCase = new RefreshAuthenticationUseCase({
        authenticationRepository: container.authenticationRepository,
      });
      const { accessToken } = await useCase.execute({ refreshToken });
      res.json({ status: 'success', data: { accessToken } });
    } catch (e) {
      next(e);
    }
  });

  // Logout
  app.delete('/authentications', async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new InvariantError('Refresh token is required');
      const useCase = new LogoutUserUseCase({
        authenticationRepository: container.authenticationRepository,
      });
      await useCase.execute({ refreshToken });
      res.json({ status: 'success' });
    } catch (e) {
      next(e);
    }
  });
};