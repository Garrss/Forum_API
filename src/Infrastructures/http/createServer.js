/* eslint-disable no-unused-vars */
import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import DomainErrorTranslator from '../../Commons/exceptions/DomainErrorTranslator.js';
import { UsersPlugin } from './plugins/UsersPlugin.js';
import { AuthenticationsPlugin } from './plugins/AuthenticationsPlugin.js';
import { ThreadsPlugin } from './plugins/ThreadsPlugin.js';

config();

// Rate limiter: max 90 requests per minute for /threads and sub-paths
const threadsRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 90, // max 90 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests. Please try again later.',
  },
});

export const createServer = (container) => {
  const app = express();
  app.use(express.json());

  // Apply rate limit ONLY to /threads and everything under it
  app.use('/threads', threadsRateLimiter);

  // Auth middleware
  app.use((req, _res, next) => {
    const { authorization } = req.headers;
    if (authorization?.startsWith('Bearer ')) {
      try {
        req.auth = jwt.verify(
          authorization.replace('Bearer ', ''),
          process.env.ACCESS_TOKEN_KEY,
        );
      } catch {
        // Invalid token — protected routes reject via requireAuth
      }
    }
    next();
  });

  UsersPlugin(app, container);
  AuthenticationsPlugin(app, container);
  ThreadsPlugin(app, container);

  // Global error handler
  app.use((err, _req, res, _next) => {
    const translated = DomainErrorTranslator.translate(err);
    const statusCode = translated.statusCode || 500;

    if (statusCode === 500) {
      console.error('[SERVER ERROR]', err);
    }

    res.status(statusCode).json({
      status: statusCode >= 500 ? 'error' : 'fail',
      message:
        statusCode === 500 ? 'Internal server error' : translated.message,
    });
  });

  return app;
};
