import express from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import DomainErrorTranslator from '../../Commons/exceptions/DomainErrorTranslator.js';

import { UsersPlugin } from './plugins/UsersPlugin.js';
import { AuthenticationsPlugin } from './plugins/AuthenticationsPlugin.js';
import { ThreadsPlugin } from './plugins/ThreadsPlugin.js';

export const createServer = (container) => {
  const app = express();
  app.use(express.json());

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
        // Token invalid
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
    const message =
      statusCode === 500 ? 'Internal server error' : translated.message;

    res.status(statusCode).json({
      status: statusCode >= 500 ? 'error' : 'fail',
      message,
    });
  });

  return app;
};