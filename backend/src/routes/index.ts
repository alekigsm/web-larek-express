import { Router } from 'express';
import { celebrate } from 'celebrate';
import productRouter from './product';
import orderRouter from './order';
import authRouter from './auth';
import orderSchema from '../middlewares/validation-order';
import productSchema from '../middlewares/validation-product';
import uploadRouter from './upload';

const router = Router();

router.use('/product', celebrate({ body: productSchema }), productRouter);
router.use('/order', celebrate({ body: orderSchema }), orderRouter);
router.use('/auth', authRouter);
router.use('/upload', uploadRouter);
export default router;
