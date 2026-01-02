import authRepository from '../auth/auth.repository.js';

class AdminService {
  async getAllUsers() {
    const users = await authRepository.findAll();
    return users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt
    }));
  }
}

export default new AdminService();

