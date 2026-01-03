import User from './auth.model.js';

const findByUsername = async (username) => {
  // Username уже должен быть нормализован, но на всякий случай нормализуем еще раз
  const normalizedUsername = username.toLowerCase().trim();
  return await User.findOne({ username: normalizedUsername });
};

const create = async (userData) => {
  try {
    const user = new User(userData);
    return await user.save();
  } catch (error) {
    // Логируем ошибку создания для отладки
    console.error('Error creating user:', error);
    throw error;
  }
};

const findById = async (userId) => {
  return await User.findById(userId);
};

const findAll = async () => {
  return await User.find({}).select('-passwordHash');
};

const count = async () => {
  return await User.countDocuments();
};

export default {
  findByUsername,
  create,
  findById,
  findAll,
  count
};

