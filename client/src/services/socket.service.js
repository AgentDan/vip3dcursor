import { io } from 'socket.io-client';
import { API_BASE_URL } from '../utils/config.js';

let socket = null;

export const connectSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }

  const serverUrl = API_BASE_URL || 'http://127.0.0.1:3000';
  
  socket = io(serverUrl, {
    auth: {
      token: token
    },
    transports: ['websocket', 'polling']
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
