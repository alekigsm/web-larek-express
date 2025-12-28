import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import productRoutes from './routes/product';
import orderRoutes from './routes/order';

dotenv.config();

const app = express();
const { PORT = 3000 } = process.env;
const { DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek' } = process.env;

const cors = require('cors');
// Подключение к MongoDB
mongoose.connect(DB_ADDRESS);

// Middleware в правильном порядке:
app.use(cors()); // 1. CORS первым
app.use(express.json()); // 2. Парсинг JSON
app.use(express.urlencoded({ extended: true })); // 3. Парсинг form-data
app.use(express.static(path.join(__dirname, 'public'))); // 4. Статические файлы
app.use('/', productRoutes);
app.use('/', orderRoutes);

app.listen(PORT, () => {
  console.log('Сервер запущен на порту', { PORT });
});
