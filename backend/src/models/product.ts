import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';

export interface IImage {
  fileName: string;
  originalName: string;
}

export interface IProduct {
  title: string;
  image: IImage;
  category: string;
  description?: string;
  price?: number | null;
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

productSchema.post('findOneAndDelete', async (doc) => {
  if (doc && doc.image && doc.image.fileName) {
    try {
      const fileName = path.basename(doc.image.fileName);
      const filePath = path.join('public/images', fileName);

      await fs.unlink(filePath);
    } catch (error) {
      // Игнорируем ошибку если файла нет
    }
  }
});
export default mongoose.model<IProduct>('product', productSchema);
