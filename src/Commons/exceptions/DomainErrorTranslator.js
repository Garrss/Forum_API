import InvariantError from './InvariantError.js';

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  // Users
  'USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'Username, password, and fullname are required',
  ),
  'USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'Username, password, and fullname must be strings',
  ),
  'USER.USERNAME_LIMIT_CHAR': new InvariantError(
    'Username cannot exceed 50 characters',
  ),
  'USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError(
    'Username can only contain letters, numbers, and underscores',
  ),

  // Authentications
  'AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'Access token and refresh token are required',
  ),
  'AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'Access token and refresh token must be strings',
  ),
  'AUTHENTICATION.WRONG_PASSWORD': new InvariantError(
    'Username or password is incorrect',
  ),

  // Threads
  'THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'Thread requires title and body',
  ),
  'THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'Thread title and body must be strings',
  ),

  // Comments
  'COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'Comment requires content',
  ),
  'COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'Comment content must be a string',
  ),

  // Replies
  'REPLY.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'Reply requires content',
  ),
  'REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'Reply content must be a string',
  ),
};

export default DomainErrorTranslator;
