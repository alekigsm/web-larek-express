import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { errors } from 'celebrate';
import { errorLogger, requestLogger } from './middlewares/logger';
import NotFoundError from './errors/not-found-error';
import errorHandler from './middlewares/error-handler';
import router from './routes/index';

dotenv.config();

const app = express();
const { PORT = 3000 } = process.env;
const { DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek' } = process.env;

// Подключение к MongoDB
mongoose.connect(DB_ADDRESS);

// Middleware в правильном порядке:
app.use(cors()); // 1. CORS первым
app.use(express.json()); // 2. Парсинг JSON
app.use(express.urlencoded({ extended: true })); // 3. Парсинг form-data
app.use(express.static(path.join(__dirname, 'public'))); // 4. Статические файлы
// log запросов
app.use(requestLogger);
// route
app.use('/', router);
app.use('*', (_req, _res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});
// log ошибок
app.use(errorLogger);

// ошибки
app.use(errors());
app.use(errorHandler);
app.listen(PORT, () => {
  console.log('Сервер запущен на порту', { PORT });
});
