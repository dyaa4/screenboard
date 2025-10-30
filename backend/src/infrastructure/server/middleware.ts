import express, { Express, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { auth, UnauthorizedError, InsufficientScopeError, InvalidTokenError } from 'express-oauth2-jwt-bearer';
import { initializeUser } from './middlewares/authMiddleware';
import { config } from '../../config/config';
import axios from 'axios';

export const setupMiddleware = (app: Express): void => {
  const allowedOrigins = ['https://screen-board.com', "https://www.screen-board.com", "http://localhost:5000"];

  app.use(cors({
    origin: (origin, callback) => {
      // Wenn kein Origin (z.B. Postman) oder erlaubte Origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  }));

  // Preflight-Optionen für alle Routen
  app.options('*', cors());


  app.use(express.json());

  const jwtCheck = auth({
    audience: config.auth0.audience,
    issuerBaseURL: `https://${config.auth0.domain}/`,
    tokenSigningAlg: 'RS256',
    jwksUri: `https://${config.auth0.domain}/.well-known/jwks.json`,

  });

  const errorHandler: ErrorRequestHandler = async (err, _req, res, next) => {
    console.error('Auth error details:', JSON.stringify(err, null, 2));

    if (err instanceof UnauthorizedError || err instanceof InvalidTokenError) {
      console.error('Unauthorized error:', err.message);

      // Versuchen Sie, die Metadaten manuell abzurufen
      try {
        const response = await axios.get(`https://${config.auth0.domain}/.well-known/openid-configuration`);
        console.log('Successfully fetched metadata:', response.data);
      } catch (metadataError) {
        console.error('Failed to fetch metadata:', metadataError);
      }

      return res.status(401).json({ error: 'Invalid token', message: err.message });
    } else if (err instanceof InsufficientScopeError) {
      return res.status(403).json({ error: 'Insufficient scope', message: err.message });
    }
    next(err);
  };

  app.use('/api', async (req, res, next) => {
    const excludedPaths = [
      '/google/calendar/webhook',
      '/auth/smartthings/webhook',
      '/auth/smartthings/callback',
    ];
    console.log("Incoming path:", req.path);
    if (excludedPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    try {
      await new Promise<void>((resolve, reject) => {
        jwtCheck(req, res, (err?: any) => {
          if (err) return reject(err);
          resolve();
        });
      });
      await initializeUser(req, res, next); // User initialisieren
    } catch (error) {
      next(error);
    }
  });

  app.use(errorHandler);

};

