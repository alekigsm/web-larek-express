import { Router } from 'express';
import { createProduct, getAllProducts } from '../controllers/product';

const router = Router();

router.get('/', getAllProducts);
router.post('/', createProduct);

export default router;
