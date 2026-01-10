import { Joi } from 'celebrate';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(30).optional()
    .default('Ё-мое')
    .messages({
      'string.base': 'Имя должно быть строкой',
      'string.min': 'Имя должно содержать минимум 2 символа',
      'string.max': 'Имя должно содержать максимум 30 символов',
    }),
  email: Joi.string().email().required().messages({
    'string.email': 'Некорректный формат email',
    'any.required': 'Email обязателен для заполнения',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Пароль должен содержать минимум 6 символов',
    'any.required': 'Пароль обязателен для заполнения',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Некорректный формат email',
    'any.required': 'Email обязателен для заполнения',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Пароль обязателен для заполнения',
  }),
});
