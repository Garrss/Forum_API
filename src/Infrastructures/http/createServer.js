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

// 90 requests per 60 seconds
const rateLimiter = new RateLimiterMemory({
  points: 90,
  duration: 60,
  blockDuration: 60,
});

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim());
    // Get the first non-private IP
    const publicIp = ips.find((ip) => {
      return (
        !ip.startsWith('10.') &&
        !ip.startsWith('172.') &&
        !ip.startsWith('192.168.') &&
        ip !== '127.0.0.1' &&
        ip !== '::1'
      );
    });
    return publicIp || ips[0];
  }
  return req.ip || 'shared';
};

const threadsRateLimiterMiddleware = async (req, res, next) => {
  try {
    const key = getClientIp(req);
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

  // Trust ALL proxy hops on Render
  app.set('trust proxy', true);

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

  // Add this TEMPORARILY inside createServer, before UsersPlugin
  app.get('/debug-ip', (req, res) => {
    res.json({
      ip: req.ip,
      ips: req.ips,
      forwarded: req.headers['x-forwarded-for'],
      remoteAddress: req.connection?.remoteAddress,
      realIp: getClientIp(req),
    });
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
};;
