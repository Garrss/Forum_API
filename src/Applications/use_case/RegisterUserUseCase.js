import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { User } from '../../Domains/users/entities/User.js';

export class RegisterUserUseCase {
  constructor({ userRepository }) {
    this._userRepository = userRepository;
  }

  async execute({ username, password, fullname }) {
    new User({ username, password, fullname });
    await this._userRepository.checkUsernameAvailability(username);
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = `user-${nanoid(16)}`;
    return this._userRepository.addUser({ id, username, password: hashedPassword, fullname });
  }
}