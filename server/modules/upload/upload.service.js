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

const deleteFile = async (filename, username = null) => {
  try {
    let filePath;
    
    // Если указан username, ищем файл в папке пользователя
    if (username) {
      const normalizedUsername = username.toLowerCase().trim();
      filePath = path.join(uploadDir, normalizedUsername, filename);
    } else {
      // Иначе ищем в корневой папке
      filePath = path.join(uploadDir, filename);
    }
    
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
    
    // Проверяем, существует ли директория upload
    try {
      await fs.access(uploadDir);
    } catch (error) {
      // Если директория не существует, возвращаем пустой массив
      console.warn('Upload directory does not exist:', uploadDir);
      return [];
    }
    
    // Получаем список всех папок в upload директории
    let entries;
    try {
      entries = await fs.readdir(uploadDir, { withFileTypes: true });
    } catch (error) {
      console.error('Error reading upload directory:', error);
      // Если не удалось прочитать с withFileTypes, пробуем без него
      try {
        const fileNames = await fs.readdir(uploadDir);
        entries = await Promise.all(
          fileNames.map(async (name) => {
            const filePath = path.join(uploadDir, name);
            const stats = await fs.stat(filePath);
            return {
              name,
              isDirectory: () => stats.isDirectory(),
              isFile: () => stats.isFile()
            };
          })
        );
      } catch (fallbackError) {
        console.error('Error reading upload directory (fallback):', fallbackError);
        return [];
      }
    }
    
    for (const entry of entries) {
      // Получаем имя файла/папки (поддерживаем оба формата)
      const entryName = entry.name || entry;
      
      
      try {
        const entryPath = path.join(uploadDir, entryName);
        const entryStats = await fs.stat(entryPath);
        
        if (entryStats.isDirectory()) {
          const username = entryName;
          const userDir = entryPath;
          
          try {
            // Получаем все файлы в папке пользователя
            const files = await fs.readdir(userDir);
            
            for (const file of files) {
              try {
                const filePath = path.join(userDir, file);
                const stats = await fs.stat(filePath);
                
                // Проверяем, что это файл, а не директория
                if (stats.isFile()) {
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
                console.error(`Error reading file ${file} for user ${username}:`, error);
                // Продолжаем обработку других файлов
              }
            }
          } catch (error) {
            console.error(`Error reading directory for user ${username}:`, error);
            // Продолжаем обработку других папок
          }
        } else if (entryStats.isFile()) {
          // Файлы в корневой папке upload (без владельца)
          allFiles.push({
            filename: entryName,
            username: null,
            size: entryStats.size,
            createdAt: entryStats.birthtime,
            modifiedAt: entryStats.mtime,
            url: `/uploads/${entryName}`,
            path: entryPath
          });
        }
      } catch (error) {
        console.error(`Error processing entry ${entryName}:`, error);
        // Продолжаем обработку других entries
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

const getGltfInfo = async (filename, username) => {
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

    // Проверяем существование файла
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error('File not found');
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const gltf = JSON.parse(fileContent);

    // Извлекаем всю информацию из GLTF
    const gltfInfo = {
      // Основная информация о файле
      version: gltf.asset?.version || null,
      generator: gltf.asset?.generator || null,
      copyright: gltf.asset?.copyright || null,
      
      // Информация о сценах
      scenes: gltf.scenes?.map((scene, index) => ({
        index,
        name: scene.name || null,
        nodes: scene.nodes || [],
        extras: scene.extras || null
      })) || [],
      
      // Информация о нодах
      nodes: gltf.nodes?.map((node, index) => ({
        index,
        name: node.name || null,
        mesh: node.mesh || null,
        children: node.children || [],
        extras: node.extras || null
      })) || [],
      
      // Информация о мешах
      meshes: gltf.meshes?.map((mesh, index) => ({
        index,
        name: mesh.name || null,
        primitives: mesh.primitives?.length || 0,
        extras: mesh.extras || null
      })) || [],
      
      // Информация о материалах
      materials: gltf.materials?.map((material, index) => ({
        index,
        name: material.name || null,
        extras: material.extras || null
      })) || [],
      
      // Все экстрасы из scenes[0]
      extras: gltf.scenes?.[0]?.extras || null,
      
      // Экстрасы env из scenes[0].extras.env
      env: gltf.scenes?.[0]?.extras?.env || [],
      
      // Полный объект extras из scenes[0]
      scenesExtras: gltf.scenes?.[0]?.extras || null
    };

    return gltfInfo;
  } catch (error) {
    console.error('Error reading GLTF info:', error);
    throw error;
  }
};

const updateGltfEnv = async (filePath, envParams) => {
  try {
    // filePath приходит как /uploads/username/file.gltf
    // Нужно преобразовать в полный путь к файлу
    // Убираем /uploads/ из начала пути
    const relativePath = filePath.replace(/^\/uploads\//, '');
    const fullPath = path.join(uploadDir, relativePath);
    
    // Проверяем, существует ли файл
    try {
      await fs.access(fullPath);
    } catch (error) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Проверяем, что это GLTF файл
    if (!fullPath.endsWith('.gltf')) {
      throw new Error('File must be a GLTF file');
    }
    
    // Читаем GLTF файл
    const fileContent = await fs.readFile(fullPath, 'utf-8');
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
    
    // Обновляем env параметры
    // Убеждаемся, что все параметры правильно сериализуются
    const sanitizedEnvParams = envParams.map(param => {
      if (!param || typeof param !== 'object') {
        return param;
      }
      
      const sanitized = { ...param };
      
      // Сохраняем все свойства параметра
      // Для чисел убеждаемся, что они остаются числами
      if (sanitized.intensity !== undefined && sanitized.intensity !== null) {
        sanitized.intensity = Number(sanitized.intensity);
      }
      if (sanitized.red !== undefined && sanitized.red !== null) {
        sanitized.red = Number(sanitized.red);
      }
      if (sanitized.green !== undefined && sanitized.green !== null) {
        sanitized.green = Number(sanitized.green);
      }
      if (sanitized.blue !== undefined && sanitized.blue !== null) {
        sanitized.blue = Number(sanitized.blue);
      }
      
      // Для environment параметров сохраняем все свойства
      if (sanitized.type === 'environment') {
        // Сохраняем file как есть (строка), даже если это пустая строка
        if (sanitized.file !== undefined && sanitized.file !== null) {
          sanitized.file = String(sanitized.file);
        }
        // Сохраняем background как boolean
        if (sanitized.background !== undefined && sanitized.background !== null) {
          sanitized.background = Boolean(sanitized.background);
        }
        // Убеждаемся, что type сохраняется
        if (sanitized.type) {
          sanitized.type = String(sanitized.type);
        }
      }
      
      return sanitized;
    });
    
    gltf.scenes[0].extras.env = sanitizedEnvParams;
    
    // Сохраняем обновленный GLTF файл
    await fs.writeFile(fullPath, JSON.stringify(gltf, null, 2), 'utf-8');
    
    return {
      filename: path.basename(fullPath),
      envCount: envParams.length,
      message: 'GLTF env parameters updated successfully'
    };
  } catch (error) {
    console.error('Error updating GLTF env:', error);
    throw error;
  }
};

export default {
  getUploadedFiles,
  deleteFile,
  getAllFilesWithOwners,
  getGltfBackground,
  updateGltfBackground,
  getGltfInfo,
  updateGltfEnv
};

