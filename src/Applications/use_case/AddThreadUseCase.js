import { nanoid } from 'nanoid';
import Thread from '../../Domains/threads/entities/Thread.js';

export class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const thread = new Thread(useCasePayload);
    const id = `thread-${nanoid(16)}`;
    return this._threadRepository.addThread({ id, ...thread });
  }
}