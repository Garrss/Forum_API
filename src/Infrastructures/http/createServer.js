/* eslint-disable no-unused-vars */
import express from 'express';
import jwt from 'jsonwebtoken';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { config } from 'dotenv';
import DomainErrorTranslator from '../../Commons/exceptions/DomainErrorTranslator.js';
import { UsersPlugin } from './plugins/UsersPlugin.js';
import { AuthenticationsPlugin } from './plugins/AuthenticationsPlugin.js';
import { ThreadsPlugin } from './plugins/ThreadsPlugin.js';

config();

// 90 requests per 60 seconds = 1 request per ~667ms
// Using sliding window — no burst allowed
const rateLimiter = new RateLimiterMemory({
  points: 90, // 90 requests
  duration: 60, // per 60 seconds
  blockDuration: 60, // block for 60 seconds after limit exceeded
});

const threadsRateLimiterMiddleware = async (req, res, next) => {
  try {
    // Use IP as key — trust proxy for Render
    const key = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    await rateLimiter.consume(key);
    next();
  } catch {
    res.status(429).json({
      status: 'fail',
      message: 'Too many requests. Please try again after a minute.',
    });
  }
};

export const createServer = (container) => {
  const app = express();

  // Required for Render/Railway to correctly get client IP
  app.set('trust proxy', 1);

  app.use(express.json());

  // Apply rate limit ONLY to /threads and all sub-paths
  app.use('/threads', threadsRateLimiterMiddleware);

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
        // Invalid token
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
