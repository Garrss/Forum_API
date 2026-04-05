import 'dotenv/config';
import { createServer } from './Infrastructures/http/createServer.js';
import { UserRepositoryPostgres } from './Infrastructures/database/postgres/repositories/UserRepositoryPostgres.js';
import { AuthenticationRepositoryPostgres } from './Infrastructures/database/postgres/repositories/AuthenticationRepositoryPostgres.js';
import { ThreadRepositoryPostgres } from './Infrastructures/database/postgres/repositories/ThreadRepositoryPostgres.js';
import { CommentRepositoryPostgres } from './Infrastructures/database/postgres/repositories/CommentRepositoryPostgres.js';
import { ReplyRepositoryPostgres } from './Infrastructures/database/postgres/repositories/ReplyRepositoryPostgres.js';

const container = {
  userRepository: new UserRepositoryPostgres(),
  authenticationRepository: new AuthenticationRepositoryPostgres(),
  threadRepository: new ThreadRepositoryPostgres(),
  commentRepository: new CommentRepositoryPostgres(),
  replyRepository: new ReplyRepositoryPostgres(),
};

const app = createServer(container);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));