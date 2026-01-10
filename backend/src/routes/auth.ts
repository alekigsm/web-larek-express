import { Router } from 'express';
import { celebrate } from 'celebrate';
import authLimiter from '../middlewares/rate-limiter';
import { loginSchema, registerSchema } from '../middlewares/validation-user';
import {
  getCurrentUser, login, logout, refreshAccessToken, register,
} from '../controllers/auth';
import auth from '../middlewares/auth';

const router = Router();

router.post('/login', authLimiter, celebrate({ body: loginSchema }), login);
router.post('/register', authLimiter, celebrate({ body: registerSchema }), register);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', auth, getCurrentUser);

export default router;
