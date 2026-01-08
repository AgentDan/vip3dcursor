import chatRepository from './chat.repository.js';

const createOrGetChat = async (userId, username) => {
  // Ищем существующий активный чат
  let chat = await chatRepository.findChatByUserId(userId);
  
  if (!chat) {
    // Создаем новый чат
    chat = await chatRepository.createChat({
      userId,
      username,
      status: 'pending'
    });
  }
  
  return chat;
};

const sendMessage = async (chatId, text, from) => {
  const chat = await chatRepository.findChatById(chatId);
  if (!chat) {
    throw new Error('Chat not found');
  }
  
  const message = await chatRepository.saveMessage({
    chatId,
    text,
    from
  });
  
  return message;
};

const getChatHistory = async (chatId) => {
  const chat = await chatRepository.findChatById(chatId);
  if (!chat) {
    throw new Error('Chat not found');
  }
  
  const messages = await chatRepository.getChatMessages(chatId);
  return {
    chat,
    messages
  };
};

const getUserChat = async (userId) => {
  const chat = await chatRepository.findChatByUserId(userId);
  if (!chat) {
    return null;
  }
  
  const messages = await chatRepository.getChatMessages(chat._id);
  return {
    chat,
    messages
  };
};

const getAllChats = async (status = null) => {
  return await chatRepository.getAllChats(status);
};

const markAsRead = async (chatId, from = 'user') => {
  return await chatRepository.markMessagesAsRead(chatId, from);
};

const getUnreadCount = async (chatId, from = 'user') => {
  return await chatRepository.getUnreadCount(chatId, from);
};

const getUnreadCountForAdmin = async () => {
  return await chatRepository.getUnreadCountForAdmin();
};

export default {
  createOrGetChat,
  sendMessage,
  getChatHistory,
  getUserChat,
  getAllChats,
  markAsRead,
  getUnreadCount,
  getUnreadCountForAdmin
};
