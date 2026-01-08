import express from 'express';
import chatController from './chat.controller.js';

const router = express.Router();

router.get('/chats', chatController.getAllChats);
router.get('/chats/:chatId', chatController.getChatHistory);
router.get('/user/chat', chatController.getUserChat);
router.post('/send', chatController.sendMessage);
router.post('/chats/:chatId/read', chatController.markAsRead);
router.get('/unread-count', chatController.getUnreadCount);

export default router;
