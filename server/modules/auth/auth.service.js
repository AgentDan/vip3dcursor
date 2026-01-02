import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRepository from './auth.repository.js';

class AuthService {
  async register(email, password) {
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Проверяем, есть ли уже пользователи в системе
    const userCount = await authRepository.count();
    const isFirstUser = userCount === 0;

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authRepository.create({
      email,
      passwordHash,
      isAdmin: isFirstUser // Первый пользователь автоматически становится админом
    });

    return this.generateToken(user);
  }

  async login(email, password) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    return this.generateToken(user);
  }

  generateToken(user) {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin || false
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    return { 
      token, 
      userId: user._id.toString(), 
      email: user.email,
      isAdmin: user.isAdmin || false
    };
  }
}

export default new AuthService();

