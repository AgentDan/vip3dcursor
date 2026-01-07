import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import uploadController from './upload.controller.js';
import { authenticate, isAdmin } from '../../middleware/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      let uploadPath = path.join(__dirname, '../../upload');
      
      // Проверяем, является ли это запросом на загрузку в uploadlab
      // Используем req.originalUrl или req.url для более надежной проверки
      const url = (req.originalUrl || req.url || req.path || '').toLowerCase();
      
      if (url.includes('/uploadlab/file') || url.includes('/uploadlab')) {
        uploadPath = path.join(uploadPath, 'uploadlab');
      } else {
        // Если указан username, сохраняем в папку пользователя
        const username = req.params.username || req.body.username || req.query.username;
        if (username) {
          const normalizedUsername = username.toLowerCase().trim();
          uploadPath = path.join(uploadPath, normalizedUsername);
        }
      }
      
      // Создаем папку, если её нет (синхронно)
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    } catch (error) {
      console.error('Multer destination error:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Фильтр файлов - разрешаем только определенные типы
const fileFilter = (req, file, cb) => {
  // Для uploadlab разрешаем все типы файлов
  const url = (req.originalUrl || req.url || '').toLowerCase();
  if (url.includes('/uploadlab/file')) {
    cb(null, true);
    return;
  }
  
  // Для остальных загрузок разрешаем только определенные типы
  const allowedTypes = ['.gltf', '.glb', '.jpg', '.jpeg', '.png', '.gif', '.pdf', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

const router = express.Router();

// Загрузка файла (требует аутентификации)
// Поддерживает опциональный параметр username для загрузки в папку пользователя
router.post('/file', authenticate, upload.single('file'), uploadController.uploadFile);

// Загрузка файла в папку пользователя (для админов)
router.post('/file/user/:username', authenticate, upload.single('file'), uploadController.uploadFileToUser);

// Получить список загруженных файлов (требует аутентификации)
router.get('/files', authenticate, uploadController.getUploadedFiles);

// Получить все файлы со всех пользователей (требует аутентификации)
router.get('/files/all', authenticate, uploadController.getAllFilesWithOwners);

// Удалить файл (требует аутентификации)
router.delete('/file/:filename', authenticate, uploadController.deleteFile);

// Получить background из GLTF файла
router.get('/gltf/:username/:filename/background', authenticate, uploadController.getGltfBackground);

// Обновить background в GLTF файле
router.put('/gltf/:username/:filename/background', authenticate, uploadController.updateGltfBackground);

// Получить информацию и экстрасы из GLTF файла
router.get('/gltf/:username/:filename/info', authenticate, uploadController.getGltfInfo);

// Получить все типы из env объекта GLTF файла в uploadlab (должен быть ПЕРЕД /uploadlab/file)
router.get('/uploadlab/gltf/env/types', authenticate, uploadController.getUploadLabGltfEnvTypes);

// Получить полную структуру env из GLTF файла в uploadlab (должен быть ПЕРЕД /uploadlab/file)
router.get('/uploadlab/gltf/env/structure', authenticate, uploadController.getUploadLabGltfEnvStructure);

// Обновить env параметры в GLTF файле из uploadlab (только для администраторов)
router.put('/uploadlab/gltf/env', authenticate, isAdmin, uploadController.updateUploadLabGltfEnv);

// Получить файл из uploadlab
router.get('/uploadlab/file', authenticate, uploadController.getUploadLabFile);

// Загрузить файл в uploadlab (требует аутентификации)
router.post('/uploadlab/file', authenticate, upload.single('file'), uploadController.uploadUploadLabFile);

// Удалить файл из uploadlab (требует аутентификации)
router.delete('/uploadlab/file', authenticate, uploadController.deleteUploadLabFile);

export default router;

