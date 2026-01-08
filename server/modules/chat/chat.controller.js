import chatService from './chat.service.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    const result = await chatService.getChatHistory(chatId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserChat = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await chatService.getUserChat(userId);
    
    if (!result) {
      return res.json({ chat: null, messages: [] });
    }
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllChats = async (req, res) => {
  try {
    const status = req.query.status || null;
    const chats = await chatService.getAllChats(status);
    res.json(chats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    
    if (!chatId || !text) {
      return res.status(400).json({ error: 'chatId and text are required' });
    }
    
    const from = req.user.isAdmin ? 'admin' : 'user';
    const message = await chatService.sendMessage(chatId, text.trim(), from);
    
    // Помечаем сообщения как прочитанные
    if (req.user.isAdmin) {
      await chatService.markAsRead(chatId, 'user');
    }
    
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const from = req.user.isAdmin ? 'user' : 'admin';
    await chatService.markAsRead(chatId, from);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const count = await chatService.getUnreadCountForAdmin();
      return res.json({ count });
    }
    
    const userId = req.user.userId;
    const chat = await chatService.getUserChat(userId);
    
    if (!chat) {
      return res.json({ count: 0 });
    }
    
    const count = await chatService.getUnreadCount(chat.chat._id, 'admin');
    res.json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default {
  getChatHistory: [authenticate, getChatHistory],
  getUserChat: [authenticate, getUserChat],
  getAllChats: [authenticate, getAllChats],
  sendMessage: [authenticate, sendMessage],
  markAsRead: [authenticate, markAsRead],
  getUnreadCount: [authenticate, getUnreadCount]
};
