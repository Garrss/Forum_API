import InvariantError from './InvariantError.js';

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('Thread requires title and body'),
  'THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('Thread title and body must be strings'),
  'COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('Comment requires content'),
  'COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('Comment content must be a string'),
  'REPLY.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('Reply requires content'),
  'REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('Reply content must be a string'),
};

export default DomainErrorTranslator;
