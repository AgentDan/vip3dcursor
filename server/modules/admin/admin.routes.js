import express from 'express';
import adminController from './admin.controller.js';
import { authenticate, isAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/users', authenticate, isAdmin, adminController.getAllUsers.bind(adminController));

export default router;

