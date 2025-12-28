import { Request, Response } from 'express';
import Product from '../models/product';

export const getAllProducts = (_req: Request, res: Response) => Product
  .find({})
  .then((products) => res.send({ items: products, total: products.length }))
  .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));

export const createProduct = (req: Request, res: Response) => {
  const {
    title, image, category, description, price,
  } = req.body;

  Product.findOne({ title })
    .then((uniqTitle) => {
      if (uniqTitle) {
        throw new Error('Товар с таким названием уже существует');
      }
      return Product
        .create({
          title,
          image,
          category,
          description,
          price,
        });
    })
    .then((item) => res.send(item))
    .catch((error) => {
      if (error.message === 'Товар с таким названием уже существует') {
        res.status(400).send(error.message);
      } else {
        res.status(500).send({ message: 'ошибка' });
      }
    });
};
