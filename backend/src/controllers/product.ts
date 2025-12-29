import { NextFunction, Request, Response } from 'express';
import Product from '../models/product';
import InternalServerError from '../errors/internal-server-error';
import ConflictError from '../errors/conflict-error';

export const getAllProducts = (_req: Request, res: Response, next: NextFunction) => Product
  .find({})
  .then((products) => res.send({ items: products, total: products.length }))
  .catch(() => next(new InternalServerError('Ошибка со стороны сервера')));

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    title, image, category, description, price,
  } = req.body;

  return Product
    .create({
      title,
      image,
      category,
      description,
      price,
    })
    .then((item) => res.send(item))
    .catch((error) => {
      if (error.code === 11000) {
        return next(new ConflictError(`товар с именем ${title} уже существуюет`));
      }
      return next(new InternalServerError('Ошибка со стороны сервера'));
    });
};
