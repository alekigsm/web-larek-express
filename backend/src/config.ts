import dotenv from 'dotenv';

dotenv.config();

const {
  NODE_ENV = 'development',
  PORT = 3000,
  JWT_ACCESS_SECRET = 'some-secret-access-key',
  JWT_REFRESH_SECRET = 'some-secret-refresh-key',
  AUTH_REFRESH_TOKEN_EXPIRY = '7d',
  AUTH_ACCESS_TOKEN_EXPIRY = '10m',
  DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek',
} = process.env;

const config = {
  NODE_ENV,
  PORT: Number(PORT),
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  AUTH_REFRESH_TOKEN_EXPIRY,
  AUTH_ACCESS_TOKEN_EXPIRY,
  DB_ADDRESS,
};

export default config;
