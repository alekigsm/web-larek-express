import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import UnauthorizedError from '../errors/unauthorized-error';
import BadRequestError from '../errors/bad-request-error';
import User from '../models/user';
import NotFoundError from '../errors/not-found-error';
import InternalServerError from '../errors/internal-server-error';
import ConflictError from '../errors/conflict-error';
import config from '../config';

export const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id || (req as any).userId;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return next(new UnauthorizedError('Требуется авторизация'));
  }

  return User.findById(userId)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден'));
      }

      return res.send({
        user: {
          name: user.name,
          email: user.email,
        },
        success: true,
      });
    })
    .catch(() => next(new InternalServerError('Ошибка со стороны сервера')));
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user: any) => {
      const accessToken = jwt.sign(
        { _id: user._id },
        config.JWT_ACCESS_SECRET || 'some-secret-access-key',
        { expiresIn: '10m' },
      );

      const refreshToken = jwt.sign(
        { _id: user._id },
        config.JWT_REFRESH_SECRET || 'some-secret-refresh-key',
        { expiresIn: '7d' },
      );

      user.tokens.push({ token: refreshToken });
      return user.save().then(() => ({ user, accessToken, refreshToken }));
    })
    .then(({ user, accessToken, refreshToken }: any) => {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
      res.send({
        user: {
          email: user.email,
          name: user.name,
        },
        accessToken,
        success: true,
      });
    })
    .catch((error: Error) => {
      if (error instanceof UnauthorizedError) {
        return next(error); // 401 - неправильные учетные данные
      }
      return next(new InternalServerError('Ошибка со стороны сервера'));
    });
};

export const register = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  return User.findOne({ email })
    .then((existingUser: any) => {
      if (existingUser) {
        throw new ConflictError('Пользователь с таким email уже существует');
      }
      return bcrypt.hash(password, 10);
    })
    .then((hashedPassword: string) => User.create({
      name: name || 'Ё-мое',
      email,
      password: hashedPassword,
      tokens: [],
    }))
    .then((user: any) => {
      const accessToken = jwt.sign(
        { _id: user._id },
        config.JWT_ACCESS_SECRET || 'some-secret-access-key',
        { expiresIn: '10m' },
      );

      const refreshToken = jwt.sign(
        { _id: user._id },
        config.JWT_REFRESH_SECRET || 'some-secret-refresh-key',
        { expiresIn: '7d' },
      );
      user.tokens.push({ token: refreshToken });
      return user.save().then(() => ({ user, accessToken, refreshToken }));
    })
    .then(({ user, accessToken, refreshToken }: any) => {
      res.cookie('refreshToken', refreshToken, {
        sameSite: 'lax',
        secure: false,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      res.send({
        user: {
          email: user.email,
          name: user.name,
        },
        accessToken,
        success: true,
      });
    })
    .catch((error: Error) => {
      if (error instanceof ConflictError) {
        return next(error);
      }
      if (error.name === 'ValidationError') {
        return next(new BadRequestError('Ошибка валидации данных'));
      }
      return next(new InternalServerError('Ошибка со стороны сервера'));
    });
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(new UnauthorizedError('Требуется авторизация'));
  }
  let decoded: { _id: string };
  try {
    decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET || 'some-secret-refresh-key') as { _id: string };
  } catch (err) {
    return next(new BadRequestError('Недействительный токен'));
  }
  const userId = decoded._id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new BadRequestError('Невалидный идентификатор пользователя'));
  }
  return User.findOneAndUpdate(
    { _id: userId },
    { $pull: { tokens: { token: refreshToken } } },
    { new: true },
  ).select('+tokens')
    .then((user: any) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.clearCookie('refreshToken', { path: '/' });
      res.send({ success: true });
    })
    .catch((error: Error) => {
      if (error instanceof NotFoundError) {
        return next(error);
      }
      return next(new InternalServerError('Ошибка сервера'));
    });
};

export const refreshAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new UnauthorizedError('Refresh токен не передан'));
  }

  let decoded: { _id: string };

  try {
    decoded = jwt.verify(
      refreshToken,
      config.JWT_REFRESH_SECRET || 'some-secret-refresh-key',
    ) as { _id: string };
  } catch (err) {
    return next(new UnauthorizedError('Недействительный или просроченный токен'));
  }

  const userId = decoded._id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new BadRequestError('Невалидный идентификатор пользователя'));
  }
  return User.findOne({
    _id: userId,
    'tokens.token': refreshToken,
  })
    .select('+tokens')
    .then((userDoc) => {
      if (!userDoc) {
        throw new NotFoundError('Пользователь не найден');
      }
      const newAccessToken = jwt.sign(
        { _id: userDoc._id },
        config.JWT_ACCESS_SECRET || 'some-secret-access-key',
        { expiresIn: '10m' },
      );

      const newRefreshToken = jwt.sign(
        { _id: userDoc._id },
        config.JWT_REFRESH_SECRET || 'some-secret-refresh-key',
        { expiresIn: '7d' },
      );
      return User.findOneAndUpdate(
        {
          _id: userId,
          'tokens.token': refreshToken,
        },
        {
          $set: {
            'tokens.$.token': newRefreshToken,
          },
        },
        { new: true },
      ).then((updatedUser: any) => {
        if (!updatedUser) {
          throw new UnauthorizedError('Ошибка при обновлении токена');
        }
        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        });
        res.send({
          user: {
            email: updatedUser.email,
            name: updatedUser.name,
          },
          accessToken: newAccessToken,
          success: true,
        });
      });
    })
    .catch((error: Error) => {
      if (error instanceof UnauthorizedError) {
        return next(error);
      }
      return next(new UnauthorizedError('Недействительный токен'));
    });
};
