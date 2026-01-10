import { Router } from 'express';
import {
  createProduct, deleteProduct, getAllProducts, updateProduct,
} from '../controllers/product';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', getAllProducts);
router.post('/', auth, createProduct);
router.patch('/:productId', auth, updateProduct);
router.delete('/:productId', auth, deleteProduct);

export default router;
