import pool from '../pool.js';
import AuthenticationRepository from '../../../../Domains/authentications/AuthenticationRepository.js';
import InvariantError from '../../../../Commons/exceptions/InvariantError.js';

export class AuthenticationRepositoryPostgres extends AuthenticationRepository {
  async addToken(token) {
    await pool.query('INSERT INTO authentications(token) VALUES($1)', [token]);
  }

  async checkTokenAvailability(token) {
    const result = await pool.query(
      'SELECT token FROM authentications WHERE token=$1',
      [token],
    );
    if (!result.rowCount) throw new InvariantError('refresh token tidak ditemukan di database');
  }

  async deleteToken(token) {
    await pool.query('DELETE FROM authentications WHERE token=$1', [token]);
  }
}