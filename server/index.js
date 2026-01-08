import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем переменные окружения с указанием пути
dotenv.config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({extended: true}))

// Статическая раздача загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, 'upload')));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI?.replace(/^["']|["']$/g, '');
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, './client/dist')));
  app.get('*', (req, res) =>
      res.sendFile(
          path.resolve(__dirname, './client/dist/index.html')
      )
  );
} else {
  app.get('/', (req, res) => res.send('Please set to production'));
}


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

