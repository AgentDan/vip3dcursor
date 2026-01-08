import { API_BASE_URL } from '../utils/config.js';

const API_URL = `${API_BASE_URL}/api/chat`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const getUserChat = async () => {
  const response = await fetch(`${API_URL}/user/chat`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch chat');
  }

  return await response.json();
};

const getAllChats = async (status = null) => {
  const url = status ? `${API_URL}/chats?status=${status}` : `${API_URL}/chats`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch chats');
  }

  return await response.json();
};

const getChatHistory = async (chatId) => {
  const response = await fetch(`${API_URL}/chats/${chatId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch chat history');
  }

  return await response.json();
};

const sendMessage = async (chatId, text) => {
  const response = await fetch(`${API_URL}/send`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ chatId, text })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }

  return await response.json();
};

const markAsRead = async (chatId) => {
  const response = await fetch(`${API_URL}/chats/${chatId}/read`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark as read');
  }

  return await response.json();
};

const getUnreadCount = async () => {
  const response = await fetch(`${API_URL}/unread-count`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get unread count');
  }

  return await response.json();
};

export default {
  getUserChat,
  getAllChats,
  getChatHistory,
  sendMessage,
  markAsRead,
  getUnreadCount
};
