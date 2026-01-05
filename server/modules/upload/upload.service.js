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

const getGltfBackground = async (filename, username) => {
  try {
    let filePath;
    if (username) {
      const normalizedUsername = username.toLowerCase().trim();
      filePath = path.join(uploadDir, normalizedUsername, filename);
    } else {
      filePath = path.join(uploadDir, filename);
    }

    console.log('Reading GLTF file from path:', filePath); // Debug log

    // Проверяем, что файл существует и это .gltf файл
    if (!filename.endsWith('.gltf')) {
      throw new Error('File must be a .gltf file');
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const gltf = JSON.parse(fileContent);
    
    console.log('GLTF scenes[0].extras.env:', JSON.stringify(gltf.scenes?.[0]?.extras?.env, null, 2)); // Debug log

    // Извлекаем информацию о background из extras.env
    // Ищем объект с type: "background" в extras.env
    let backgroundData = null;
    if (gltf.scenes && gltf.scenes[0] && gltf.scenes[0].extras && gltf.scenes[0].extras.env) {
      const backgroundEnv = gltf.scenes[0].extras.env.find(env => env.type === 'background');
      if (backgroundEnv) {
        console.log('Found background env:', JSON.stringify(backgroundEnv, null, 2)); // Debug log
        
        // Используем intensity из объекта background, если он есть
        // Если intensity отсутствует, используем значение по умолчанию 1.0
        const intensity = backgroundEnv.intensity !== undefined ? backgroundEnv.intensity : 1.0;
        console.log('Extracted intensity:', intensity, 'Type:', typeof intensity); // Debug log
        
        backgroundData = {
          red: backgroundEnv.red !== undefined ? backgroundEnv.red : 255,
          green: backgroundEnv.green !== undefined ? backgroundEnv.green : 0,
          blue: backgroundEnv.blue !== undefined ? backgroundEnv.blue : 0,
          intensity: intensity,
          enabled: backgroundEnv.enabled !== undefined ? backgroundEnv.enabled : true,
          file: backgroundEnv.file || null
        };
        
        console.log('Returning background data:', backgroundData); // Debug log
      } else {
        console.log('Background env not found in extras.env'); // Debug log
      }
    } else {
      console.log('No extras.env found in scenes[0]'); // Debug log
    }

    // Если background данных нет, возвращаем default (red)
    if (!backgroundData) {
      backgroundData = {
        red: 255,
        green: 0,
        blue: 0,
        intensity: 1.0,
        enabled: true,
        file: null
      };
    }

    return backgroundData;
  } catch (error) {
    console.error('Error reading GLTF background:', error);
    throw error;
  }
};

const updateGltfBackground = async (filename, username, backgroundData) => {
  try {
    let filePath;
    if (username) {
      const normalizedUsername = username.toLowerCase().trim();
      filePath = path.join(uploadDir, normalizedUsername, filename);
    } else {
      filePath = path.join(uploadDir, filename);
    }

    // Проверяем, что файл существует и это .gltf файл
    if (!filename.endsWith('.gltf')) {
      throw new Error('File must be a .gltf file');
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const gltf = JSON.parse(fileContent);

    // Инициализируем структуру, если её нет
    if (!gltf.scenes) {
      gltf.scenes = [{}];
    }
    if (!gltf.scenes[0]) {
      gltf.scenes[0] = {};
    }
    if (!gltf.scenes[0].extras) {
      gltf.scenes[0].extras = {};
    }
    if (!gltf.scenes[0].extras.env) {
      gltf.scenes[0].extras.env = [];
    }

    // Находим или создаем background entry
    let backgroundEnv = gltf.scenes[0].extras.env.find(env => env.type === 'background');
    if (!backgroundEnv) {
      backgroundEnv = {
        type: 'background',
        name: 'Background'
      };
      gltf.scenes[0].extras.env.push(backgroundEnv);
    }

    // Обновляем только те данные, которые переданы
    // Leva контролирует только intensity, остальные параметры не изменяем
    if (backgroundData.intensity !== undefined) {
      backgroundEnv.intensity = backgroundData.intensity;
    }
    // Остальные параметры (red, green, blue, enabled) не обновляем, если они не переданы
    // Это позволяет Leva контролировать только intensity

    // Сохраняем обновленный GLTF файл
    await fs.writeFile(filePath, JSON.stringify(gltf, null, 2), 'utf-8');

    return backgroundEnv;
  } catch (error) {
    console.error('Error updating GLTF background:', error);
    throw error;
  }
};

export default {
  getUploadedFiles,
  deleteFile,
  getAllFilesWithOwners,
  getGltfBackground,
  updateGltfBackground
};

