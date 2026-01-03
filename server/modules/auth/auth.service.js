import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRepository from './auth.repository.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadBaseDir = path.join(__dirname, '../../upload');

const generateToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    username: user.username,
    isAdmin: user.isAdmin || false
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });

  return { 
    token, 
    userId: user._id.toString(), 
    username: user.username,
    isAdmin: user.isAdmin || false
  };
};

const register = async (username, password) => {
  // Проверка JWT_SECRET
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  // Нормализуем username (lowercase и trim) - так же как в модели
  const normalizedUsername = username.toLowerCase().trim();
  
  console.log('Register attempt for username:', normalizedUsername);
  
  const existingUser = await authRepository.findByUsername(normalizedUsername);
  console.log('Existing user check result:', existingUser ? 'Found' : 'Not found');
  
  if (existingUser) {
    console.log('User already exists with username:', existingUser.username);
    throw new Error('User already exists');
  }

  // Проверяем, есть ли уже пользователи в системе
  const userCount = await authRepository.count();
  const isFirstUser = userCount === 0;

  const passwordHash = await bcrypt.hash(password, 10);
  
  try {
    const user = await authRepository.create({
      username: normalizedUsername, // Используем нормализованный username
      passwordHash,
      isAdmin: isFirstUser // Первый пользователь автоматически становится админом
    });

    // Создаем папку для пользователя в server/upload
    try {
      const userUploadDir = path.join(uploadBaseDir, normalizedUsername);
      await fs.mkdir(userUploadDir, { recursive: true });
      console.log(`Created upload directory for user: ${normalizedUsername}`);
    } catch (dirError) {
      console.error(`Error creating upload directory for user ${normalizedUsername}:`, dirError);
      // Не прерываем создание пользователя, если папка не создалась
    }

    console.log('User created successfully:', user.username);
    return generateToken(user);
  } catch (createError) {
    // Если ошибка уникальности на уровне MongoDB
    if (createError.code === 11000 || createError.name === 'MongoServerError') {
      console.log('Duplicate key error - user already exists in DB');
      throw new Error('User already exists');
    }
    // Пробрасываем другие ошибки дальше
    throw createError;
  }
};

const login = async (username, password) => {
  // Проверка JWT_SECRET
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  // Нормализуем username (lowercase и trim) - так же как в модели
  const normalizedUsername = username.toLowerCase().trim();
  
  const user = await authRepository.findByUsername(normalizedUsername);
  if (!user) {
    throw new Error('Invalid username or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }

  return generateToken(user);
};

export default {
  register,
  login,
  generateToken
};

