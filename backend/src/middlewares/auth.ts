import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized-error';
import config from '../config';

declare global {
  namespace Express {
    interface Request {
      user?: { _id: string };
    }
  }
}

const auth = (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Требуется авторизация'));
  }

  const accessToken = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(
      accessToken,
      config.JWT_ACCESS_SECRET || 'some-secret-access-key',
    ) as { _id: string };
  } catch (err) {
    return next(new UnauthorizedError('Требуется авторизация'));
  }
  req.user = { _id: payload._id };
  return next();
};
export default auth;
