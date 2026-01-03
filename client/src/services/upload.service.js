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

const deleteFile = async (filename) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/file/${filename}`, {
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

export default {
  uploadFile,
  uploadFileToUser,
  getFiles,
  deleteFile
};

