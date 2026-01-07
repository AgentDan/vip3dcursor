import uploadService from './upload.service.js';
import fs from 'fs';

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const username = req.body.username || req.query.username;
    const filePath = username 
      ? `/uploads/${username}/${req.file.filename}`
      : `/uploads/${req.file.filename}`;

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: filePath,
      username: username || null
    };

    res.status(201).json({
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

const uploadFileToUser = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const normalizedUsername = username.toLowerCase().trim();
    const filePath = `/uploads/${normalizedUsername}/${req.file.filename}`;

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: filePath,
      username: normalizedUsername
    };

    res.status(201).json({
      message: `File uploaded successfully to user ${normalizedUsername}`,
      file: fileInfo
    });
  } catch (error) {
    console.error('Upload to user error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

const getUploadedFiles = async (req, res) => {
  try {
    const files = await uploadService.getUploadedFiles();
    res.status(200).json(files);
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const username = req.query.username; // Получаем username из query параметров
    await uploadService.deleteFile(filename, username);
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete file' });
  }
};

const getAllFilesWithOwners = async (req, res) => {
  try {
    const files = await uploadService.getAllFilesWithOwners();
    res.status(200).json(files);
  } catch (error) {
    console.error('Get all files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

const getGltfBackground = async (req, res) => {
  try {
    const { filename, username } = req.params;
    const backgroundData = await uploadService.getGltfBackground(filename, username);
    res.status(200).json(backgroundData);
  } catch (error) {
    console.error('Get GLTF background error:', error);
    res.status(500).json({ error: error.message || 'Failed to get GLTF background' });
  }
};

const updateGltfBackground = async (req, res) => {
  try {
    const { filename, username } = req.params;
    const { red, green, blue, intensity, enabled } = req.body;
    await uploadService.updateGltfBackground(filename, username, { red, green, blue, intensity, enabled });
    res.status(200).json({ message: 'GLTF background updated successfully' });
  } catch (error) {
    console.error('Update GLTF background error:', error);
    res.status(500).json({ error: error.message || 'Failed to update GLTF background' });
  }
};

const getGltfInfo = async (req, res) => {
  try {
    const { filename, username } = req.params;
    const gltfInfo = await uploadService.getGltfInfo(filename, username);
    res.status(200).json(gltfInfo);
  } catch (error) {
    console.error('Get GLTF info error:', error);
    res.status(500).json({ error: error.message || 'Failed to get GLTF info' });
  }
};

const getUploadLabFile = async (req, res) => {
  try {
    const file = await uploadService.getUploadLabFile();
    if (!file) {
      return res.status(200).json({ file: null, message: 'No file in uploadlab' });
    }
    res.status(200).json({ file });
  } catch (error) {
    console.error('Get uploadlab file error:', error);
    res.status(500).json({ error: error.message || 'Failed to get uploadlab file' });
  }
};

const uploadUploadLabFile = async (req, res) => {
  try {
    if (!req.file) {
      console.error('Upload uploadlab file - No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Проверяем, существует ли файл физически
    if (!fs.existsSync(req.file.path)) {
      console.error('Upload uploadlab file - File does NOT exist at path:', req.file.path);
      return res.status(500).json({ error: 'File was not saved correctly' });
    }

    // Удаляем старые файлы, КРОМЕ только что загруженного
    await uploadService.deleteUploadLabFile(req.file.filename);

    // Проверяем, что новый файл все еще существует после удаления старых
    if (!fs.existsSync(req.file.path)) {
      console.error('Upload uploadlab file - ERROR: New file was deleted!');
      return res.status(500).json({ error: 'File was not saved correctly' });
    }

    const filePath = `/uploads/uploadlab/${req.file.filename}`;

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: filePath
    };

    console.log('Upload uploadlab file - file info:', fileInfo);

    res.status(201).json({
      message: 'Uploadlab file uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Upload uploadlab file error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload uploadlab file' });
  }
};

const deleteUploadLabFile = async (req, res) => {
  try {
    await uploadService.deleteUploadLabFile();
    res.status(200).json({ message: 'Uploadlab file deleted successfully' });
  } catch (error) {
    console.error('Delete uploadlab file error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete uploadlab file' });
  }
};

const getUploadLabGltfEnvTypes = async (req, res) => {
  try {
    const result = await uploadService.getUploadLabGltfEnvTypes();
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error('Get uploadlab GLTF env types error:', error);
    res.status(500).json({ error: error.message || 'Failed to get GLTF env types' });
  }
};

const getUploadLabGltfEnvStructure = async (req, res) => {
  try {
    const result = await uploadService.getUploadLabGltfEnvStructure();
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error('Get uploadlab GLTF env structure error:', error);
    res.status(500).json({ error: error.message || 'Failed to get GLTF env structure' });
  }
};

const updateUploadLabGltfEnv = async (req, res) => {
  try {
    // Проверяем права администратора
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { env } = req.body;
    
    if (!env || !Array.isArray(env)) {
      return res.status(400).json({ error: 'env parameter must be an array' });
    }
    
    const result = await uploadService.updateUploadLabGltfEnv(env);
    res.status(200).json(result);
  } catch (error) {
    console.error('Update uploadlab GLTF env error:', error);
    res.status(500).json({ error: error.message || 'Failed to update uploadlab GLTF env' });
  }
};

export default {
  uploadFile,
  uploadFileToUser,
  getUploadedFiles,
  getAllFilesWithOwners,
  deleteFile,
  getGltfBackground,
  updateGltfBackground,
  getGltfInfo,
  getUploadLabFile,
  uploadUploadLabFile,
  deleteUploadLabFile,
  getUploadLabGltfEnvTypes,
  getUploadLabGltfEnvStructure,
  updateUploadLabGltfEnv
};

