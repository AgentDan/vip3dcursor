import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../upload');

const getUploadedFiles = async () => {
  try {
    const files = await fs.readdir(uploadDir);
    const fileInfos = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadDir, filename);
        const stats = await fs.stat(filePath);
        return {
          filename,
          size: stats.size,
          createdAt: stats.birthtime,
          url: `/uploads/${filename}`
        };
      })
    );
    return fileInfos;
  } catch (error) {
    console.error('Error reading upload directory:', error);
    throw error;
  }
};

const deleteFile = async (filename) => {
  try {
    const filePath = path.join(uploadDir, filename);
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('File not found');
    }
    throw error;
  }
};

const getAllFilesWithOwners = async () => {
  try {
    const allFiles = [];
    
    // Получаем список всех папок в upload директории
    const entries = await fs.readdir(uploadDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const username = entry.name;
        const userDir = path.join(uploadDir, username);
        
        try {
          // Получаем все файлы в папке пользователя
          const files = await fs.readdir(userDir);
          
          for (const file of files) {
            const filePath = path.join(userDir, file);
            const stats = await fs.stat(filePath);
            
            allFiles.push({
              filename: file,
              username: username,
              size: stats.size,
              createdAt: stats.birthtime,
              modifiedAt: stats.mtime,
              url: `/uploads/${username}/${file}`,
              path: filePath
            });
          }
        } catch (error) {
          console.error(`Error reading directory for user ${username}:`, error);
          // Продолжаем обработку других папок
        }
      } else if (entry.isFile()) {
        // Файлы в корневой папке upload (без владельца)
        const filePath = path.join(uploadDir, entry.name);
        const stats = await fs.stat(filePath);
        
        allFiles.push({
          filename: entry.name,
          username: null,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          url: `/uploads/${entry.name}`,
          path: filePath
        });
      }
    }
    
    // Сортируем по дате создания (новые первыми)
    allFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return allFiles;
  } catch (error) {
    console.error('Error reading all files:', error);
    throw error;
  }
};

export default {
  getUploadedFiles,
  deleteFile,
  getAllFilesWithOwners
};

