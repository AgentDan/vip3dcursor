const API_URL = '/api/upload';

const uploadFile = async (file, username = null) => {
  const token = localStorage.getItem('token');
  
  const formData = new FormData();
  formData.append('file', file);
  if (username) {
    formData.append('username', username);
  }
  
  const response = await fetch(`${API_URL}/file`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }

  return await response.json();
};

const uploadFileToUser = async (file, username) => {
  const token = localStorage.getItem('token');
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/file/user/${username}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }

  return await response.json();
};

const getFilesForConstructor = async () => {
  const token = localStorage.getItem('token');
  
  // Получаем username из токена
  const decoded = JSON.parse(atob(token.split('.')[1]));
  const username = decoded?.username;
  
  // Получаем все файлы
  const response = await fetch(`${API_URL}/files/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch files');
  }
  
  const allFiles = await response.json();
  
  // Фильтруем файлы текущего пользователя
  const userFiles = allFiles.filter(file => file.username === username);
  
  return userFiles;
};

const getFiles = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/files`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch files');
  }

  return await response.json();
};

const getAllFilesWithOwners = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/files/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch all files');
  }

  return await response.json();
};

const deleteFile = async (filename, username = null) => {
  const token = localStorage.getItem('token');
  
  // Добавляем username в query параметр, если он указан
  const url = username 
    ? `${API_URL}/file/${filename}?username=${encodeURIComponent(username)}`
    : `${API_URL}/file/${filename}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete file');
  }

  return await response.json();
};

const getGltfBackground = async (filename, username) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/gltf/${username}/${filename}/background`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get GLTF background');
  }

  return await response.json();
};

const updateGltfBackground = async (filename, username, backgroundData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/gltf/${username}/${filename}/background`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(backgroundData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update GLTF background');
  }

  return await response.json();
};

const getGltfInfo = async (filename, username) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/gltf/${username}/${filename}/info`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get GLTF info');
  }

  return await response.json();
};

export default {
  uploadFile,
  uploadFileToUser,
  getFiles,
  getAllFilesWithOwners,
  getFilesForConstructor,
  deleteFile,
  getGltfBackground,
  updateGltfBackground,
  getGltfInfo
};

