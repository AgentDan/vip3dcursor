const API_URL = '/api/admin';

const getUsers = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch users');
  }

  return await response.json();
};

export default {
  getUsers
};

