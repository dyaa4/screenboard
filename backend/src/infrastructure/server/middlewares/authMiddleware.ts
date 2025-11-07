import { NextFunction, Response } from 'express';
import UserModel from '../../database/UserModel';
import logger from '../../../utils/logger';


const domain = process.env.AUTH0_DOMAIN;

if (!domain) {
  throw new Error('Auth0 domain is not defined in environment variables');
}

let userCache: Record<string, any> = {}; // In-memory Cache

export const initializeUser = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  const timer = logger.startTimer('Auth Middleware');

  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      logger.warn('Auth middleware: Missing authorization token', { path: req.path }, 'AuthMiddleware');
      return res.status(401).send('Token fehlt');
    }

    const cachedUser = userCache[token];
    if (cachedUser) {
      logger.debug('Auth middleware: Using cached user', { userId: cachedUser.userId, path: req.path }, 'AuthMiddleware');
      req.user = cachedUser;
      timer();
      return next();
    }

    logger.apiCall('Auth0', '/userinfo', 'GET');
    const response = await fetch(`https://${domain}/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      logger.warn('Auth middleware: Auth0 userinfo request failed', {
        status: response.status,
        statusText: response.statusText,
        path: req.path
      }, 'AuthMiddleware');
      throw new Error(
        `Fehler beim Abrufen von Userinfo: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const { sub: userId, email, name } = data;

    logger.auth('User authenticated successfully', userId, 'Auth0', true);
    logger.info('Auth middleware: Processing user request', {
      userId,
      path: req.path,
      email: email || 'unknown'
    });

    let user = await UserModel.findOne({ auth0Id: userId });

    if (!user) {
      logger.info('Creating new user in database', { userId, email }, 'AuthMiddleware');
      user = new UserModel({ auth0Id: userId, email, name });
      await user.save();
      logger.database('CREATE', 'users', undefined, 1);
    } else {
      logger.database('FIND', 'users', undefined, 1);
    }

    req.user = user;
    userCache[token] = user; // User in den Cache legen

    logger.success('Auth middleware completed successfully', { userId, path: req.path }, 'AuthMiddleware');
    timer();
    next();
  } catch (error) {
    logger.error('Auth middleware failed', error as Error, 'AuthMiddleware');
    logger.auth('User authentication failed', undefined, 'Auth0', false);
    res.status(500).send('Serverfehler');
  }
};
