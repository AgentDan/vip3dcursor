import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../modules/auth/auth.model.js';

dotenv.config();

const fixIndexes = async () => {
  try {
    // Убираем кавычки, если они есть
    const mongoUri = process.env.MONGODB_URI?.replace(/^["']|["']$/g, '') || 'mongodb://localhost:27017/arh3d';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected to:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Скрываем пароль в логах

    // Получаем коллекцию
    const collection = User.collection;
    
    // Получаем все индексы
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    // Удаляем индекс username, если он существует
    try {
      await collection.dropIndex('username_1');
      console.log('Index username_1 dropped successfully');
    } catch (error) {
      if (error.code === 27) {
        console.log('Index username_1 does not exist');
      } else {
        throw error;
      }
    }

    // Удаляем индекс email, если он существует (может быть с ошибкой)
    try {
      await collection.dropIndex('email_1');
      console.log('Index email_1 dropped successfully');
    } catch (error) {
      if (error.code === 27) {
        console.log('Index email_1 does not exist');
      } else {
        console.log('Could not drop email_1 index:', error.message);
      }
    }

    // Удаляем индекс username, если он существует (может быть с ошибкой)
    try {
      await collection.dropIndex('username_1');
      console.log('Index username_1 dropped successfully');
    } catch (error) {
      if (error.code === 27) {
        console.log('Index username_1 does not exist');
      } else {
        console.log('Could not drop username_1 index:', error.message);
      }
    }

    // Удаляем документы с null или пустым username
    const deleteResult = await collection.deleteMany({ 
      $or: [
        { username: null },
        { username: '' },
        { username: { $exists: false } }
      ]
    });
    console.log(`Deleted ${deleteResult.deletedCount} documents with invalid username`);

    // Пересоздаем индексы из схемы
    await User.createIndexes();
    console.log('Indexes recreated from schema');

    // Показываем финальные индексы
    const finalIndexes = await collection.indexes();
    console.log('Final indexes:', finalIndexes);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fixIndexes();

