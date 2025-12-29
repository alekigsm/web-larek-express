import { Router } from 'express';
import { celebrate } from 'celebrate';
import productRouter from './product';
import orderRouter from './order';
import orderSchema from '../middlewares/validation-order';
import productSchema from '../middlewares/validation-product';

const router = Router();

router.use('/product', celebrate({ body: productSchema }), productRouter);
router.use('/order', celebrate({ body: orderSchema }), orderRouter);

export default router;
