import { LoginUserUseCase } from '../../../Applications/use_case/LoginUserUseCase.js';
import { LogoutUserUseCase } from '../../../Applications/use_case/LogoutUserUseCase.js';
import { RefreshAuthenticationUseCase } from '../../../Applications/use_case/RefreshAuthenticationUseCase.js';

export const AuthenticationsPlugin = (app, container) => {
  app.post('/authentications', async (req, res, next) => {
    try {
      const useCase = new LoginUserUseCase({
        userRepository: container.userRepository,
        authenticationRepository: container.authenticationRepository,
      });
      const tokens = await useCase.execute(req.body);
      res.status(201).json({ status: 'success', data: tokens });
    } catch (e) {
      next(e);
    }
  });

  app.put('/authentications', async (req, res, next) => {
    try {
      const useCase = new RefreshAuthenticationUseCase({
        authenticationRepository: container.authenticationRepository,
      });
      const { accessToken } = await useCase.execute(req.body);
      res.json({ status: 'success', data: { accessToken } });
    } catch (e) {
      next(e);
    }
  });

  app.delete('/authentications', async (req, res, next) => {
    try {
      const useCase = new LogoutUserUseCase({
        authenticationRepository: container.authenticationRepository,
      });
      await useCase.execute(req.body);
      res.json({ status: 'success' });
    } catch (e) {
      next(e);
    }
  });
};
