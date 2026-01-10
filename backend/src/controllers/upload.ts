import { NextFunction, Request, Response } from 'express';

const upload = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { file } = req;

    if (!file) {
      return next(new Error('Файл не загружен'));
    }

    return res.send({
      fileName: `/images/${file.filename}`,
      originalName: file.originalname,
    });
  } catch (error) {
    return next(error);
  }
};
export default upload;
