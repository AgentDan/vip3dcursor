import chatService from './chat.service.js';
import jwt from 'jsonwebtoken';

const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.username = decoded.username;
    socket.isAdmin = decoded.isAdmin || false;
    
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

export const setupChatSocket = (io) => {
  // Middleware для аутентификации
  io.use(authenticateSocket);
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.username} (${socket.isAdmin ? 'admin' : 'user'})`);
    
    // Пользователь присоединяется к своей комнате
    if (!socket.isAdmin) {
      socket.join(`user:${socket.userId}`);
    } else {
      // Админ присоединяется к комнате админов
      socket.join('admins');
    }
    
    // Создание или получение чата (для пользователя)
    socket.on('get-chat', async () => {
      try {
        if (socket.isAdmin) {
          // Админ получает список всех чатов
          const chats = await chatService.getAllChats();
          socket.emit('chats-list', chats);
        } else {
          // Пользователь получает свой чат
          const result = await chatService.getUserChat(socket.userId);
          if (result) {
            socket.emit('chat-data', result);
          } else {
            socket.emit('chat-data', { chat: null, messages: [] });
          }
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    // Отправка сообщения
    socket.on('send-message', async (data) => {
      try {
        const { chatId, text } = data;
        
        if (!text || !text.trim()) {
          return socket.emit('error', { message: 'Message text is required' });
        }
        
        let targetChatId = chatId;
        
        // Если пользователь отправляет сообщение без chatId, создаем/получаем чат
        if (!targetChatId && !socket.isAdmin) {
          const chat = await chatService.createOrGetChat(socket.userId, socket.username);
          targetChatId = chat._id.toString();
        }
        
        if (!targetChatId) {
          return socket.emit('error', { message: 'Chat ID is required' });
        }
        
        const from = socket.isAdmin ? 'admin' : 'user';
        const message = await chatService.sendMessage(targetChatId, text.trim(), from);
        
        // Получаем информацию о чате
        const { chat } = await chatService.getChatHistory(targetChatId);
        
        // Отправляем сообщение отправителю
        socket.emit('new-message', { message, chat });
        
        // Отправляем сообщение получателю
        if (socket.isAdmin) {
          // Админ отправил - отправляем пользователю
          const userId = chat.userId._id ? chat.userId._id.toString() : chat.userId.toString();
          io.to(`user:${userId}`).emit('new-message', { message, chat });
        } else {
          // Пользователь отправил - отправляем всем админам
          io.to('admins').emit('new-message', { message, chat });
          // Обновляем список чатов для админов
          const chats = await chatService.getAllChats();
          io.to('admins').emit('chats-list', chats);
        }
        
        // Помечаем как прочитанное, если админ ответил
        if (socket.isAdmin) {
          await chatService.markAsRead(targetChatId, 'user');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: error.message });
      }
    });
    
    // Пометить сообщения как прочитанные
    socket.on('mark-read', async (data) => {
      try {
        const { chatId } = data;
        const from = socket.isAdmin ? 'user' : 'admin';
        await chatService.markAsRead(chatId, from);
        
        // Уведомляем другую сторону
        if (socket.isAdmin) {
          const { chat } = await chatService.getChatHistory(chatId);
          const userId = chat.userId._id ? chat.userId._id.toString() : chat.userId.toString();
          io.to(`user:${userId}`).emit('messages-read', { chatId });
        } else {
          io.to('admins').emit('messages-read', { chatId });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    // Получить непрочитанные сообщения
    socket.on('get-unread-count', async () => {
      try {
        if (socket.isAdmin) {
          const count = await chatService.getUnreadCountForAdmin();
          socket.emit('unread-count', { count });
        } else {
          const result = await chatService.getUserChat(socket.userId);
          if (result && result.chat) {
            const count = await chatService.getUnreadCount(result.chat._id, 'admin');
            socket.emit('unread-count', { count });
          } else {
            socket.emit('unread-count', { count: 0 });
          }
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.username}`);
    });
  });
};
