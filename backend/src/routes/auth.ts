import { Router } from 'express';
import {
  getCurrentUser, login, logout, refreshAccessToken, register,
} from '../controllers/auth';
import auth from '../middlewares/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', auth, getCurrentUser);

export default router;
