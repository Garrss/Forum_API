import pool from '../pool.js';
import UserRepository from '../../../../Domains/users/UserRepository.js';
import InvariantError from '../../../../Commons/exceptions/InvariantError.js';
import NotFoundError from '../../../../Commons/exceptions/NotFoundError.js';

export class UserRepositoryPostgres extends UserRepository {
  async checkUsernameAvailability(username) {
    const result = await pool.query('SELECT id FROM users WHERE username=$1', [username]);
    if (result.rowCount) throw new InvariantError('Username already taken');
  }

  async addUser({ id, username, password, fullname }) {
    const result = await pool.query(
      'INSERT INTO users(id, username, password, fullname) VALUES($1,$2,$3,$4) RETURNING id, username, fullname',
      [id, username, password, fullname]
    );
    return result.rows[0];
  }

  async getUserByUsername(username) {
    const result = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    if (!result.rowCount) throw new NotFoundError('User not found');
    return result.rows[0];
  }

  async getUserById(userId) {
    const result = await pool.query('SELECT * FROM users WHERE id=$1', [userId]);
    if (!result.rowCount) throw new NotFoundError('User not found');
    return result.rows[0];
  }
}