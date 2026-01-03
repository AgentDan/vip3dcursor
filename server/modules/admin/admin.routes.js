import express from 'express';
import adminController from './admin.controller.js';
import { authenticate, isAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/users', authenticate, isAdmin, adminController.getAllUsers);
router.post('/users', authenticate, isAdmin, adminController.createUser);
router.delete('/users/:id', authenticate, isAdmin, adminController.deleteUser);

export default router;

