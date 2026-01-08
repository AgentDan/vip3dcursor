import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket, getSocket } from '../../services/socket.service';
import chatService from '../../services/chat.service';
import ChatMessage from '../../components/SupportChat/ChatMessage';
import './AdminChat.css';

function AdminChat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Подключаемся к Socket.IO
    const socket = connectSocket(token);
    socketRef.current = socket;

    // Обработчики Socket.IO
    socket.on('chats-list', (chatsList) => {
      setChats(chatsList);
      setLoading(false);
      updateUnreadCounts(chatsList);
    });

    socket.on('new-message', (data) => {
      if (selectedChat && selectedChat._id === data.chat._id) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
      
      // Обновляем список чатов
      socket.emit('get-chat');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Запрашиваем список чатов
    socket.emit('get-chat');

    return () => {
      disconnectSocket();
    };
  }, [navigate]);

  useEffect(() => {
    if (selectedChat) {
      loadChatHistory(selectedChat._id);
      markAsRead(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const updateUnreadCounts = async (chatsList) => {
    const counts = {};
    for (const chat of chatsList) {
      try {
        const chatMessages = await chatService.getChatHistory(chat._id);
        const unread = chatMessages.messages.filter(m => m.from === 'user' && !m.read).length;
        counts[chat._id] = unread;
      } catch (error) {
        counts[chat._id] = 0;
      }
    }
    setUnreadCounts(counts);
  };

  const loadChatHistory = async (chatId) => {
    try {
      const data = await chatService.getChatHistory(chatId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markAsRead = async (chatId) => {
    try {
      await chatService.markAsRead(chatId);
      const socket = getSocket();
      if (socket) {
        socket.emit('mark-read', { chatId });
      }
      setUnreadCounts(prev => ({ ...prev, [chatId]: 0 }));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMessages([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedChat) return;
    
    setSending(true);
    const socket = getSocket();
    
    try {
      socket.emit('send-message', { chatId: selectedChat._id, text: messageText });
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} ч назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  if (loading) {
    return (
      <div className="admin-chat-container">
        <div className="admin-chat-loading">Загрузка чатов...</div>
      </div>
    );
  }

  return (
    <div className="admin-chat-container">
      <div className="admin-chat-sidebar">
        <div className="admin-chat-sidebar-header">
          <h2>Чаты поддержки</h2>
          {totalUnread > 0 && (
            <span className="admin-chat-total-badge">{totalUnread}</span>
          )}
        </div>
        <div className="admin-chat-list">
          {chats.length === 0 ? (
            <div className="admin-chat-empty">Нет активных чатов</div>
          ) : (
            chats.map(chat => (
              <div
                key={chat._id}
                className={`admin-chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                onClick={() => handleSelectChat(chat)}
              >
                <div className="admin-chat-item-header">
                  <div className="admin-chat-item-name">@{chat.username}</div>
                  {unreadCounts[chat._id] > 0 && (
                    <span className="admin-chat-item-badge">{unreadCounts[chat._id]}</span>
                  )}
                </div>
                <div className="admin-chat-item-time">
                  {formatDate(chat.lastMessageAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="admin-chat-main">
        {selectedChat ? (
          <>
            <div className="admin-chat-header">
              <div>
                <h3>@{selectedChat.username}</h3>
                <p className="admin-chat-status">
                  {selectedChat.status === 'active' ? 'Активен' : 'Ожидает ответа'}
                </p>
              </div>
            </div>

            <div className="admin-chat-messages">
              {messages.length === 0 ? (
                <div className="admin-chat-empty-messages">Нет сообщений</div>
              ) : (
                messages.map(message => (
                  <ChatMessage
                    key={message._id}
                    message={message}
                    isOwn={message.from === 'admin'}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="admin-chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Введите сообщение..."
                className="admin-chat-input"
                disabled={sending}
              />
              <button
                type="submit"
                className="admin-chat-send"
                disabled={sending || !messageText.trim()}
              >
                {sending ? 'Отправка...' : 'Отправить'}
              </button>
            </form>
          </>
        ) : (
          <div className="admin-chat-placeholder">
            <p>Выберите чат из списка слева</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminChat;
