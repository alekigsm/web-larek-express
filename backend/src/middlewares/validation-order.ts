import { Joi } from 'celebrate';

export enum PaymentType {
  card = 'card',
  online = 'online'
}

export interface IOrder {
  payment: PaymentType;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

const orderSchema = Joi.object<IOrder>({
  payment: Joi.string()
    .valid(PaymentType.card, PaymentType.online)
    .required()
    .messages({
      'any.only': 'Допустимые значения: card или online',
      'any.required': 'Способ оплаты обязателен',
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Некорректный формат email',
      'any.required': 'Email обязателен',
    }),

  phone: Joi.string()
    .required()
    .messages({
      'any.required': 'Телефон обязателен',
    }),

  address: Joi.string()
    .required()
    .messages({
      'any.required': 'Адрес обязателен',
    }),

  total: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Сумма должна быть числом',
      'number.positive': 'Сумма должна быть положительной',
      'any.required': 'Сумма обязательна',
    }),

  items: Joi.array()
    .items(Joi.string().hex().length(24))
    .min(1)
    .required()
    .messages({
      'array.base': 'Items должен быть массивом',
      'array.min': 'Добавьте хотя бы один товар',
      'any.required': 'Список товаров обязателен',
      'string.hex': 'ID товара должен быть в hex-формате',
      'string.length': 'ID товара должен содержать 24 символа',
    }),
});

export default orderSchema;
