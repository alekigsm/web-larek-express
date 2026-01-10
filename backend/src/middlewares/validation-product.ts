import { Joi } from 'celebrate';
import { IImage, IProduct } from '../models/product';

const imageSchema = Joi.object<IImage>({
  fileName: Joi.string().required(),
  originalName: Joi.string().required(),
});

const productSchema = Joi.object<IProduct>({
  title: Joi.string().min(2).max(30)
    .required()
    .messages({
      'string.base': 'Название должно быть строкой',
      'string.min': 'Название должно содержать минимум 2 символа',
      'string.max': 'Название должно содержать максимум 30 символов',
      'any.required': 'Название обязательно',
    }),
  image: imageSchema.required().messages({
    'any.required': 'Изображение обязательно',
  }),
  category: Joi.string().required().messages({
    'any.required': 'Категория обязательна',
  }),
  description: Joi.string().optional().allow('').messages({
    'string.base': 'Описание должно быть строкой',
  }),
  price: Joi.number().integer().default(null).optional()
    .messages({
      'number.base': 'Цена должна быть числом',
      'number.integer': 'Цена должна быть целым числом',
    }),
});

export default productSchema;
