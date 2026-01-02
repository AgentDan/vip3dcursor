import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../modules/auth/auth.model.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.error('Usage: node scripts/makeAdmin.js <email>');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arh3d');
    console.log('MongoDB connected');

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();
    
    console.log(`User ${email} is now an admin`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

makeAdmin();

