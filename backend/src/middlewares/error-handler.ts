import { Request, Response, NextFunction } from 'express';

export default function errorHandler(err:any, _req:Request, res:Response, _next:NextFunction) {
  const { statusCode = 500, message } = err;

  const responseMessage = statusCode === 500
    ? 'Внутренняя ошибка сервера'
    : message;

  res.status(statusCode).json({
    message: responseMessage,
  });
}
