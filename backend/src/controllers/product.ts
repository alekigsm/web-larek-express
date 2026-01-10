import { NextFunction, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import Product from '../models/product';
import InternalServerError from '../errors/internal-server-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

export const getAllProducts = (_req: Request, res: Response, next: NextFunction) => Product
  .find({})
  .then((products) => res.send({ items: products, total: products.length }))
  .catch(() => next(new InternalServerError('Ошибка при получении товаров')));

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    title, image, category, description, price,
  } = req.body;

  if (!image || !image.fileName) {
    return next(new BadRequestError('Не указано изображение'));
  }

  // Перемещаем файл из временной в постоянную папку
  const tempFileName = path.basename(image.fileName);
  const tempPath = path.join('temp/uploads', tempFileName);
  const permanentPath = path.join('public/images', tempFileName);

  return fs.rename(tempPath, permanentPath)
    .then(() => Product.create({
      title,
      image: {
        fileName: `/images/${tempFileName}`,
        originalName: image.originalName,
      },
      category,
      description,
      price,
    }))
    .then((item) => res.send(item))
    .catch((error) => {
      if (error.code === 11000) {
        return next(new ConflictError(`Товар с именем "${title}" уже существует`));
      }
      if (error.code === 'ENOENT') {
        return next(new BadRequestError('Файл изображения не найден во временной папке'));
      }
      return next(new InternalServerError('Ошибка при создании товара'));
    });
};

export const updateProduct = (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new BadRequestError('Некорректный ID товара'));
  }
  const updateData = req.body;

  return Product.findById(productId)
    .then((currentProduct) => {
      if (!currentProduct) {
        throw new NotFoundError('Товар не найден');
      }

      if (updateData.image?.fileName) {
        const newImage = updateData.image;

        // Проверяем, меняется ли изображение
        if (currentProduct.image.fileName !== newImage.fileName) {
          const tempFileName = path.basename(newImage.fileName);
          const tempPath = path.join('temp/uploads', tempFileName);

          // Проверяем что файл существует во временной папке
          return fs.access(tempPath)
            .then(() => {
              // Удаляем старый файл
              const oldFileName = path.basename(currentProduct.image.fileName);
              const oldFilePath = path.join('public/images', oldFileName);
              return fs.unlink(oldFilePath).catch(() => {});
            })
            .then(() => {
              // Перемещаем новый файл
              const permanentPath = path.join('public/images', tempFileName);
              return fs.rename(tempPath, permanentPath);
            })
            .then(() => {
              // Обновляем путь
              updateData.image.fileName = `/images/${tempFileName}`;
              return currentProduct;
            })
            .catch(() => {
              throw new BadRequestError('Файл изображения не найден во временной папке');
            });
        }
      }
      return Promise.resolve(currentProduct);
    })
    .then(() => Product.findByIdAndUpdate(
      productId,
      updateData,
      {
        new: true,
        runValidators: true,
        upsert: false,
      },
    ))
    .then((updatedProduct) => {
      if (!updatedProduct) {
        throw new NotFoundError('Товар не найден после обновления');
      }
      res.send({
        message: 'Товар успешно обновлен',
        product: updatedProduct,
      });
    })
    .catch((error) => {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        return next(error);
      }
      return next(new InternalServerError('Ошибка при обновлении товара'));
    });
};

export const deleteProduct = (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new BadRequestError('Некорректный ID товара'));
  }
  return Product.findByIdAndDelete(productId)
    .then((deletedProduct) => {
      if (!deletedProduct) {
        throw new NotFoundError('Товар не найден');
      }
      res.send({
        message: 'Товар успешно удален',
        product: deletedProduct,
      });
    })
    .catch((error) => {
      if (error instanceof NotFoundError) {
        return next(error);
      }
      return next(new InternalServerError('Ошибка при удалении товара'));
    });
};
