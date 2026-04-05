import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from '../../src/Infrastructures/http/createServer.js';
import { UserRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/UserRepositoryPostgres.js';
import { AuthenticationRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/AuthenticationRepositoryPostgres.js';
import { ThreadRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/ThreadRepositoryPostgres.js';
import { CommentRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/CommentRepositoryPostgres.js';
import { ReplyRepositoryPostgres } from '../../src/Infrastructures/database/postgres/repositories/ReplyRepositoryPostgres.js';
import { pool } from '../helpers/testPool.js';

const container = {
  userRepository: new UserRepositoryPostgres(),
  authenticationRepository: new AuthenticationRepositoryPostgres(),
  threadRepository: new ThreadRepositoryPostgres(),
  commentRepository: new CommentRepositoryPostgres(),
  replyRepository: new ReplyRepositoryPostgres(),
};

const app = createServer(container);

// Shared state across tests
let accessToken;
let refreshToken;
let threadId;
let commentId;
let replyId;

// ─── Helpers ────────────────────────────────────────────────────────────────

const registerUser = (payload) => request(app).post('/users').send(payload);

const loginUser = (payload) =>
  request(app).post('/authentications').send(payload);

// ─── Setup / Teardown ────────────────────────────────────────────────────────

beforeAll(async () => {
  await pool.query('DELETE FROM replies');
  await pool.query('DELETE FROM comments');
  await pool.query('DELETE FROM threads');
  await pool.query('DELETE FROM authentications');
  await pool.query(
    "DELETE FROM users WHERE username IN ('testuser','seconduser')",
  );
});

afterAll(async () => {
  await pool.query('DELETE FROM replies');
  await pool.query('DELETE FROM comments');
  await pool.query('DELETE FROM threads');
  await pool.query('DELETE FROM authentications');
  await pool.query(
    "DELETE FROM users WHERE username IN ('testuser','seconduser')",
  );
});

// ─── Users ───────────────────────────────────────────────────────────────────

describe('POST /users', () => {
  it('should register user and return 201', async () => {
    const res = await registerUser({
      username: 'testuser',
      password: 'secret123',
      fullname: 'Test User',
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.addedUser.username).toBe('testuser');
  });

  it('should return 400 when payload is incomplete', async () => {
    const res = await registerUser({ username: 'testuser' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('should return 400 when username is already taken', async () => {
    const res = await registerUser({
      username: 'testuser',
      password: 'secret123',
      fullname: 'Test User',
    });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});

// ─── Authentications ─────────────────────────────────────────────────────────

describe('POST /authentications', () => {
  it('should login and return accessToken + refreshToken', async () => {
    const res = await loginUser({
      username: 'testuser',
      password: 'secret123',
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('should return 400 when credentials are wrong', async () => {
    const res = await loginUser({
      username: 'testuser',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('fail');
  });

  it('should return 400 when username missing', async () => {
    const res = await request(app)
      .post('/authentications')
      .send({ password: 'secret123' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('should return 400 when password missing', async () => {
    const res = await request(app)
      .post('/authentications')
      .send({ username: 'testuser' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});

describe('PUT /authentications', () => {
  it('should refresh access token', async () => {
    const res = await request(app)
      .put('/authentications')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should return 400 when refresh token is invalid', async () => {
    const res = await request(app)
      .put('/authentications')
      .send({ refreshToken: 'invalid-token' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('should return 400 when refresh token is missing', async () => {
    const res = await request(app).put('/authentications').send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});

describe('DELETE /authentications', () => {
  it('should logout successfully', async () => {
    const res = await request(app)
      .delete('/authentications')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('should return 400 when refresh token is not found', async () => {
    const res = await request(app)
      .delete('/authentications')
      .send({ refreshToken: 'already-deleted-token' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('re-login for remaining tests', async () => {
    const res = await loginUser({
      username: 'testuser',
      password: 'secret123',
    });
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
    expect(accessToken).toBeDefined();
  });

  it('should return 400 when refresh token is missing', async () => {
    const res = await request(app).delete('/authentications').send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});

// ─── Threads ─────────────────────────────────────────────────────────────────

describe('POST /threads', () => {
  it('should return 401 when no token', async () => {
    const res = await request(app)
      .post('/threads')
      .send({ title: 'Test Thread', body: 'Thread body' });
    expect(res.status).toBe(401);
  });

  it('should add thread and return 201', async () => {
    const res = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Test Thread', body: 'Thread body' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.addedThread.id).toBeDefined();
    expect(res.body.data.addedThread.title).toBe('Test Thread');

    threadId = res.body.data.addedThread.id;
  });

  it('should return 400 when payload is incomplete', async () => {
    const res = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Only title' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});

describe('GET /threads/:threadId', () => {
  it('should return thread detail with comments and replies', async () => {
    const res = await request(app).get(`/threads/${threadId}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.thread.id).toBe(threadId);
    expect(res.body.data.thread.comments).toBeDefined();
    expect(Array.isArray(res.body.data.thread.comments)).toBe(true);
  });

  it('should return 404 for non-existent thread', async () => {
    const res = await request(app).get('/threads/thread-nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
  });
});

// ─── Comments ─────────────────────────────────────────────────────────────────

describe('POST /threads/:threadId/comments', () => {
  it('should return 401 when no token', async () => {
    const res = await request(app)
      .post(`/threads/${threadId}/comments`)
      .send({ content: 'A comment' });
    expect(res.status).toBe(401);
  });

  it('should add comment and return 201', async () => {
    const res = await request(app)
      .post(`/threads/${threadId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'A comment' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.addedComment.id).toBeDefined();
    expect(res.body.data.addedComment.content).toBe('A comment');

    commentId = res.body.data.addedComment.id;
  });

  it('should return 400 when payload is incomplete', async () => {
    const res = await request(app)
      .post(`/threads/${threadId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('should return 404 when thread does not exist', async () => {
    const res = await request(app)
      .post('/threads/thread-nonexistent/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'A comment' });
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
  });
});

// ─── Replies ─────────────────────────────────────────────────────────────────

describe('POST /threads/:threadId/comments/:commentId/replies', () => {
  it('should return 401 when no token', async () => {
    const res = await request(app)
      .post(`/threads/${threadId}/comments/${commentId}/replies`)
      .send({ content: 'A reply' });
    expect(res.status).toBe(401);
  });

  it('should add reply and return 201', async () => {
    const res = await request(app)
      .post(`/threads/${threadId}/comments/${commentId}/replies`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'A reply' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.addedReply.id).toBeDefined();
    expect(res.body.data.addedReply.content).toBe('A reply');

    replyId = res.body.data.addedReply.id;
  });

  it('should return 400 when payload is incomplete', async () => {
    const res = await request(app)
      .post(`/threads/${threadId}/comments/${commentId}/replies`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('should return 404 when comment does not exist', async () => {
    const res = await request(app)
      .post(`/threads/${threadId}/comments/comment-nonexistent/replies`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'A reply' });
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
  });
});

// ─── Delete reply ──────────────────────────────────────────────────────────────

describe('DELETE /threads/:threadId/comments/:commentId/replies/:replyId', () => {
  it('should return 401 when no token', async () => {
    const res = await request(app).delete(
      `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
    );
    expect(res.status).toBe(401);
  });

  it('should return 403 when not the owner', async () => {
    // Register and login a second user
    await registerUser({
      username: 'seconduser',
      password: 'pass123',
      fullname: 'Second',
    });
    const loginRes = await loginUser({
      username: 'seconduser',
      password: 'pass123',
    });
    const secondToken = loginRes.body.data.accessToken;

    const res = await request(app)
      .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
      .set('Authorization', `Bearer ${secondToken}`);
    expect(res.status).toBe(403);
    expect(res.body.status).toBe('fail');
  });

  it('should delete reply and return 200', async () => {
    const res = await request(app)
      .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('should return 404 when reply does not exist', async () => {
    const res = await request(app)
      .delete(
        `/threads/${threadId}/comments/${commentId}/replies/reply-nonexistent`,
      )
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
  });
});

// ─── Delete comment ────────────────────────────────────────────────────────────

describe('DELETE /threads/:threadId/comments/:commentId', () => {
  it('should return 401 when no token', async () => {
    const res = await request(app).delete(
      `/threads/${threadId}/comments/${commentId}`,
    );
    expect(res.status).toBe(401);
  });

  it('should return 403 when not the owner', async () => {
    const loginRes = await loginUser({
      username: 'seconduser',
      password: 'pass123',
    });
    const secondToken = loginRes.body.data.accessToken;

    const res = await request(app)
      .delete(`/threads/${threadId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${secondToken}`);
    expect(res.status).toBe(403);
    expect(res.body.status).toBe('fail');
  });

  it('should delete comment and return 200', async () => {
    const res = await request(app)
      .delete(`/threads/${threadId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('should return 404 when comment does not exist', async () => {
    const res = await request(app)
      .delete(`/threads/${threadId}/comments/comment-nonexistent`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
  });
});

// ─── Additional Coverage Tests ───────────────────────────────────────────────

describe('Additional coverage for createServer', () => {
  it('should handle invalid token gracefully (cover jwt catch)', async () => {
    const res = await request(app)
      .post('/threads')
      .set('Authorization', 'Bearer invalidtoken')
      .send({ title: 'Test', body: 'Test body' });

    expect(res.status).toBe(401);
  });

  it('should work without authorization header (cover no auth branch)', async () => {
    const res = await request(app).get(`/threads/${threadId}`);

    expect(res.status).toBe(200);
  });

  it('should return 500 when unexpected error occurs (cover global error)', async () => {
    const fakeApp = createServer({
      ...container,
      threadRepository: {
        addThread: () => {
          throw new Error('unexpected error');
        },
      },
    });

    const res = await request(fakeApp)
      .post('/threads')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Test', body: 'Test body' });

    expect(res.status).toBe(500);
    expect(res.body.status).toBe('error');
  });
});
