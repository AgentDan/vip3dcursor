import authRepository from '../auth/auth.repository.js';

const getAllUsers = async () => {
  const users = await authRepository.findAll();
  return users.map(user => ({
    id: user._id.toString(),
    username: user.username,
    isAdmin: user.isAdmin || false,
    createdAt: user.createdAt
  }));
};

export default {
  getAllUsers
};

