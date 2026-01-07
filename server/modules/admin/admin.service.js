import authRepository from '../auth/auth.repository.js';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadBaseDir = path.join(__dirname, '../../upload');

const getAllUsers = async () => {
  const users = await authRepository.findAll();
  return users.map(user => ({
    id: user._id.toString(),
    username: user.username,
    isAdmin: user.isAdmin || false,
    createdAt: user.createdAt
  }));
};

const createUser = async (username, password, isAdmin = false) => {
  // Нормализуем username
  const normalizedUsername = username.toLowerCase().trim();
  
  // Проверяем, существует ли пользователь
  const existingUser = await authRepository.findByUsername(normalizedUsername);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Хешируем пароль
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Создаем пользователя
  try {
    const user = await authRepository.create({
      username: normalizedUsername,
      passwordHash,
      isAdmin: isAdmin || false
    });
    
    // Создаем папку для пользователя в server/upload
    try {
      const userUploadDir = path.join(uploadBaseDir, normalizedUsername);
      await fs.mkdir(userUploadDir, { recursive: true });
      } catch (dirError) {
      console.error(`Error creating upload directory for user ${normalizedUsername}:`, dirError);
      // Не прерываем создание пользователя, если папка не создалась
    }
    
    return {
      id: user._id.toString(),
      username: user.username,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt
    };
  } catch (createError) {
    if (createError.code === 11000 || createError.name === 'MongoServerError') {
      throw new Error('User already exists');
    }
    throw createError;
  }
};

const deleteUser = async (userId) => {
  // Проверяем, существует ли пользователь
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  const username = user.username;
  
  // Удаляем пользователя
  const deletedUser = await authRepository.deleteById(userId);
  if (!deletedUser) {
    throw new Error('Failed to delete user');
  }
  
  // Удаляем папку пользователя в server/upload
  try {
    const userUploadDir = path.join(uploadBaseDir, username);
    const dirExists = await fs.access(userUploadDir).then(() => true).catch(() => false);
    
    if (dirExists) {
      await fs.rm(userUploadDir, { recursive: true, force: true });
    }
  } catch (dirError) {
    console.error(`Error deleting upload directory for user ${username}:`, dirError);
    // Не прерываем удаление пользователя, если папка не удалилась
  }
  
  return {
    id: deletedUser._id.toString(),
    username: deletedUser.username
  };
};

export default {
  getAllUsers,
  createUser,
  deleteUser
};

