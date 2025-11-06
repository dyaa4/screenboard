import express, { Express, ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {
  auth,
  UnauthorizedError,
  InsufficientScopeError,
  InvalidTokenError,
} from 'express-oauth2-jwt-bearer';
import { initializeUser } from './middlewares/authMiddleware';
import { config } from '../../config/config';
import axios from 'axios';

const ALLOWED_ORIGINS = [
  'https://screen-board.com',
  'https://www.screen-board.com',
  'http://localhost:3000',
  'http://localhost:5000',
];

const EXCLUDED_API_PATHS = ['/google/calendar/webhook', '/auth/smartthings/webhook', '/microsoft/calendar/webhook'];

/**
 * Setup express middleware: CORS, JSON parser and API auth guard.
 */
export const setupMiddleware = (app: Express): void => {
  // CORS konfigurieren
  const corsOptions = {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  const jwtCheck = buildJwtCheck();

  // API-level guard: skip some public webhook routes
  app.use('/api', async (req: Request, res: Response, next: NextFunction) => {
    if (EXCLUDED_API_PATHS.some((p) => req.path.startsWith(p))) return next();

    try {
      await runJwtCheck(jwtCheck, req, res);
      await initializeUser(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  app.use(buildErrorHandler());
};

function buildJwtCheck() {
  return auth({
    audience: config.auth0.audience,
    issuerBaseURL: `https://${config.auth0.domain}/`,
    tokenSigningAlg: 'RS256',
    jwksUri: `https://${config.auth0.domain}/.well-known/jwks.json`,
  });
}

async function runJwtCheck(jwtCheck: ReturnType<typeof buildJwtCheck>, req: Request, res: Response) {
  await new Promise<void>((resolve, reject) => {
    // jwtCheck is an express middleware
    // @ts-ignore - types from express-oauth2-jwt-bearer are not perfectly compatible here
    jwtCheck(req, res, (err?: any) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function buildErrorHandler(): ErrorRequestHandler {
  return async (err: any, _req: Request, res: Response, next: NextFunction) => {
    console.error('Auth error details:', JSON.stringify(err, null, 2));

    if (err instanceof UnauthorizedError || err instanceof InvalidTokenError) {
      console.error('Unauthorized error:', err.message);

      // Try to fetch metadata for debugging
      try {
        const response = await axios.get(`https://${config.auth0.domain}/.well-known/openid-configuration`);
        console.log('Successfully fetched metadata:', response.data);
      } catch (metadataError) {
        console.error('Failed to fetch metadata:', metadataError);
      }

      return res.status(401).json({ error: 'Invalid token', message: err.message });
    }

    if (err instanceof InsufficientScopeError) {
      return res.status(403).json({ error: 'Insufficient scope', message: err.message });
    }

    next(err);
  };
}

