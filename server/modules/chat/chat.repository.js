import { Chat, Message } from './chat.model.js';

const createChat = async (chatData) => {
  const chat = new Chat(chatData);
  return await chat.save();
};

const findChatByUserId = async (userId) => {
  return await Chat.findOne({ userId, status: { $ne: 'closed' } });
};

const findChatById = async (chatId) => {
  return await Chat.findById(chatId).populate('userId', 'username');
};

const getAllChats = async (status = null) => {
  const query = status ? { status } : { status: { $ne: 'closed' } };
  return await Chat.find(query)
    .populate('userId', 'username')
    .sort({ lastMessageAt: -1 });
};

const updateChatLastMessage = async (chatId) => {
  return await Chat.findByIdAndUpdate(
    chatId,
    { lastMessageAt: new Date(), status: 'active' },
    { new: true }
  );
};

const closeChat = async (chatId) => {
  return await Chat.findByIdAndUpdate(
    chatId,
    { status: 'closed' },
    { new: true }
  );
};

const saveMessage = async (messageData) => {
  const message = new Message(messageData);
  await message.save();
  await updateChatLastMessage(messageData.chatId);
  return message;
};

const getChatMessages = async (chatId, limit = 100) => {
  return await Message.find({ chatId })
    .sort({ timestamp: 1 })
    .limit(limit);
};

const markMessagesAsRead = async (chatId, from = 'user') => {
  return await Message.updateMany(
    { chatId, from, read: false },
    { read: true }
  );
};

const getUnreadCount = async (chatId, from = 'user') => {
  return await Message.countDocuments({ chatId, from, read: false });
};

const getUnreadCountForAdmin = async () => {
  const chats = await Chat.find({ status: 'active' });
  let totalUnread = 0;
  
  for (const chat of chats) {
    const unread = await Message.countDocuments({ 
      chatId: chat._id, 
      from: 'user', 
      read: false 
    });
    totalUnread += unread;
  }
  
  return totalUnread;
};

export default {
  createChat,
  findChatByUserId,
  findChatById,
  getAllChats,
  updateChatLastMessage,
  closeChat,
  saveMessage,
  getChatMessages,
  markMessagesAsRead,
  getUnreadCount,
  getUnreadCountForAdmin
};
