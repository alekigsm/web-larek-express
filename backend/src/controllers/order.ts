import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { total, items } = req.body;

  try {
    const products = await Product.find({ _id: { $in: items }, price: { $ne: null } });
    if (products.length === 0) {
      return next(new BadRequestError('заказ не мб пустым'));
    }
    const totalPrice = products.reduce((sum, product) => sum + product.price!, 0);
    if (total !== totalPrice) {
      return next(new BadRequestError('итоговая сумма и сумма заказа разные'));
    }
    const id = faker.string.uuid();
    return res.send({
      id, total: totalPrice,
    });
  } catch (error) {
    return next(error);
  }
};
export default createOrder;
