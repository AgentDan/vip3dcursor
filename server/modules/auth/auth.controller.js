import authService from './auth.service.js';

const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await authService.register(username, password);
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(409).json({ error: error.message });
    }
    
    // Обработка ошибок Mongoose (например, дубликат username)
    if (error.code === 11000) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Обработка ошибок валидации Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    
    // Логируем полную ошибку для отладки
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    
    res.status(500).json({ 
      error: 'Registration failed',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        code: error.code,
        stack: error.stack
      } : undefined
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await authService.login(username, password);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Invalid username or password') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Login failed' });
  }
};

export default {
  register,
  login
};

