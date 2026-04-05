import { RegisterUserUseCase } from '../../../Applications/use_case/RegisterUserUseCase.js';

export const UsersPlugin = (app, container) => {
  app.post('/users', async (req, res, next) => {
    try {
      const useCase = new RegisterUserUseCase({
        userRepository: container.userRepository,
      });
      const addedUser = await useCase.execute(req.body);
      res.status(201).json({ status: 'success', data: { addedUser } });
    } catch (e) {
      next(e);
    }
  });
};