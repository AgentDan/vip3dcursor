const API_URL = '/api/admin';

class AdminService {
  async getUsers() {
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
  }
}

export default new AdminService();

