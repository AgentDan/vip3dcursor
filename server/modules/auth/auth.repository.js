import User from './auth.model.js';

class AuthRepository {
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async findById(userId) {
    return await User.findById(userId);
  }

  async findAll() {
    return await User.find({}).select('-passwordHash');
  }

  async count() {
    return await User.countDocuments();
  }
}

export default new AuthRepository();

