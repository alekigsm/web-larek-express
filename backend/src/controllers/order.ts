import { Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';

enum PaymentType {
  Card = 'card',
  Online = 'online',
}

interface IOrder {
    payment: PaymentType;
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
}

const createOrder = async (req: Request, res: Response) => {
  const {
    payment, email, phone, address, total, items,
  } = req.body;
  if (!payment || !email || !phone || !address || total === undefined || !items) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  if (!Array.isArray(items)) { return res.status(400).json({ error: `${items} не массив` }); }
  if (items.length === 0) { return res.status(400).json({ error: `${items} пустой массив` }); }
  if (typeof payment !== 'string') {
    return res.status(400).json({ error: 'Payment должен быть строкой' });
  }
  if (payment !== 'card' && payment !== 'online') {
    return res.status(400).json({ error: 'Payment должен быть "card" или "online"' });
  }
  if (typeof email !== 'string') {
    return res.status(400).json({ error: 'Email должен быть строкой' });
  }
  if (typeof phone !== 'string') {
    return res.status(400).json({ error: 'phone должен быть строкой' });
  }
  if (typeof address !== 'string') {
    return res.status(400).json({ error: 'address должен быть строкой' });
  }
  if (typeof total !== 'number') {
    return res.status(400).json({ error: 'total должен быть числом' });
  }
  const products = await Product.find({ _id: { $in: items }, price: { $ne: null } });
  if (products.length === 0) {
    return res.status(400).send('ID нету');
  }
  const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
  if (total !== totalPrice) {
    return res.status(400).send('суммы заказа кторая пришла не равна итоговой сумме');
  }
  const id = faker.string.uuid();
  return res.send({
    id, total,
  });
};
export default createOrder;
