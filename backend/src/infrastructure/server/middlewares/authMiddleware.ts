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
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token fehlt');
  }

  try {
    const cachedUser = userCache[token];
    if (cachedUser) {
      req.user = cachedUser;
      return next();
    }

    const response = await fetch(`https://${domain}/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Fehler beim Abrufen von Userinfo: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const { sub: userId, email, name } = data;

    //Log out path and user
    logger.info({
      msg: 'Incoming request',
      path: req.path,
      userId: userId

    });

    let user = await UserModel.findOne({ auth0Id: userId });

    if (!user) {
      user = new UserModel({ auth0Id: userId, email, name });
      await user.save();
    }

    req.user = user;
    userCache[token] = user; // User in den Cache legen
    next();
  } catch (error) {
    console.error('Fehler beim Überprüfen/Speichern des Nutzers:', error);
    res.status(500).send('Serverfehler');
  }
};
