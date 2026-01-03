import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../modules/auth/auth.model.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    const username = process.argv[2];
    
    if (!username) {
      console.error('Usage: node scripts/makeAdmin.js <username>');
      process.exit(1);
    }

    // Убираем кавычки из MONGODB_URI, если они есть
    const mongoUri = process.env.MONGODB_URI?.replace(/^["']|["']$/g, '') || 'mongodb://localhost:27017/arh3d';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    
    if (!user) {
      console.error(`User with username ${username} not found`);
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();
    
    console.log(`User ${username} is now an admin`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

makeAdmin();

