import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { errors } from 'celebrate';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { errorLogger, requestLogger } from './middlewares/logger';
import errorHandler from './middlewares/error-handler';
import router from './routes/index';
import config from './config';
import './utils/cleanup-temp';

dotenv.config();

const app = express();
const { PORT, DB_ADDRESS } = config;
// Подключение к MongoDB
mongoose.connect(DB_ADDRESS);

// Middleware в правильном порядке:
app.use(cors()); // 1. CORS первым
app.use(express.json()); // 2. Парсинг JSON
app.use(express.urlencoded({ extended: true })); // 3. Парсинг form-data
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // 4. Статические файлы
// log запросов
app.use(requestLogger);
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Слишком много запросов',
}));
// route
app.use('/', router);
// log ошибок
app.use(errorLogger);

// ошибки
app.use(errors());
app.use(errorHandler);
app.listen(PORT, () => {});
