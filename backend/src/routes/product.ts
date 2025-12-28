import { Router } from 'express';
import { createProduct, getAllProducts } from '../controllers/product';

const router = Router();

router.get('/product', getAllProducts);
router.post('/product', createProduct);

export default router;
