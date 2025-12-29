import mongoose from 'mongoose';

export interface IToken{
    token: string;
}

export interface IUser{
  name : string;
  email : string;
  password : string;
  tokens : IToken[]
}

const imageSchema = new mongoose.Schema<IImage>({
  fileName: {
    type: String,
    required: [true, 'Поле "fileName" должно быть заполнено'],
  },
  originalName: {
    type: String,
    required: [true, 'Поле "originalName" должно быть заполнено'],
  },
});

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    required: [true, 'Поле "title" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
    unique: true,
  },
  image: {
    type: imageSchema,
    required: [true, 'Поле "image" должно быть заполнено'],
  },
  category: {
    type: String,
    required: [true, 'Поле "category" должно быть заполнено'],
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    default: null,
  },
}, {
  versionKey: false,
});

export default mongoose.model<IProduct>('product', productSchema);
