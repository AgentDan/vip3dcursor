import adminService from './admin.service.js';

class AdminController {
  async getAllUsers(req, res) {
    try {
      const users = await adminService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
}

export default new AdminController();

