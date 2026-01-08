import { io } from 'socket.io-client';
import { API_BASE_URL } from '../utils/config.js';

let socket = null;

export const connectSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }

  // В продакшене используем текущий origin, в разработке - из конфига
  const isProduction = import.meta.env.PROD;
  const serverUrl = isProduction 
    ? window.location.origin  // В продакшене используем текущий домен
    : (API_BASE_URL || 'http://127.0.0.1:3000');
  
  socket = io(serverUrl, {
    auth: {
      token: token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('Socket.IO connected to:', serverUrl);
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

export default {
  connectSocket,
  disconnectSocket,
  getSocket
};
