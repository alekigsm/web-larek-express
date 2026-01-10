import rateLimit from 'express-rate-limit';

// Строгий лимитер для auth эндпоинтов
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 20, // максимум 20 попыток за 15 минут
  message: {
    status: 429,
    message: 'Слишком много попыток аутентификации. Попробуйте позже.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Не считать успешные запросы
});
export default authLimiter;
