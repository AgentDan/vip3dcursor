import uploadService from './upload.service.js';

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
    const { username } = req.query; // Получаем username из query параметра
    
    await uploadService.deleteFile(filename, username || null);
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

export default {
  uploadFile,
  uploadFileToUser,
  getUploadedFiles,
  getAllFilesWithOwners,
  deleteFile,
  getGltfBackground,
  updateGltfBackground,
  getGltfInfo
};

