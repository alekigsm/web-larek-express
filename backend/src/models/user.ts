import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import UnauthorizedError from '../errors/unauthorized-error';

export interface IToken{
    token: string;
}

export interface IUser{
  name?: string;
  email : string;
  password : string;
  tokens : IToken[]
}

interface UserModel extends mongoose.Model<IUser> {
  findUserByCredentials:
  (email: string, password: string) => Promise<mongoose.Document<unknown, any, IUser>>;
}

const tokensSchema = new mongoose.Schema<IToken>({
  token: {
    type: String,
    required: true,
  },
});

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
    default: 'Ё-мое',
  },
  email: {
    type: String,
    required: [true, 'Поле "email" должно быть заполнено'],
    unique: true,
    validate: {
      validator: (v: string) => validator.isEmail(v),
      message: 'Некорректный формат email',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Минимальная длина поля "password" - 6'],
    select: false,
  },
  tokens: {
    type: [tokensSchema],
    select: false,
  },
}, {
  versionKey: false,
});

userSchema.static('findUserByCredentials', function findUserByCredentials(email: string, password: string) {
  return this.findOne({ email })
    .select('+password +tokens')
    .then((user:IUser | null) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('Неправильная почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError('Неправильная почта или пароль'));
          }

          return user;
        });
    });
});

export default mongoose.model<IUser, UserModel>('user', userSchema);
