import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { connectSocket, disconnectSocket, getSocket } from '../../services/socket.service';
import chatService from '../../services/chat.service';
import { isAuthenticated } from '../../utils/jwt.utils';
import ChatMessage from './ChatMessage';
import './SupportChat.css';

function SupportChat() {
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Обновляем статус авторизации при изменении маршрута
  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !authenticated) return;

    // Подключаемся к Socket.IO
    const socket = connectSocket(token);
    socketRef.current = socket;

    // Загружаем чат
    loadChat();

    // Обработчики Socket.IO
    socket.on('chat-data', (data) => {
      setChat(data.chat);
      setMessages(data.messages || []);
      setLoading(false);
    });

    socket.on('new-message', (data) => {
      setMessages(prev => [...prev, data.message]);
      if (data.chat) {
        setChat(data.chat);
      }
      // Если сообщение от админа и чат закрыт - увеличиваем счетчик непрочитанных
      if (data.message.from === 'admin' && !isOpen) {
        setUnreadCount(prev => prev + 1);
      }
      scrollToBottom();
    });

    socket.on('messages-read', () => {
      setUnreadCount(0);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Запрашиваем данные чата
    socket.emit('get-chat');

    // Запрашиваем непрочитанные сообщения
    updateUnreadCount();

    // Периодически обновляем счетчик непрочитанных (каждые 5 секунд)
    const unreadInterval = setInterval(() => {
      updateUnreadCount();
    }, 5000);

    return () => {
      disconnectSocket();
      clearInterval(unreadInterval);
    };
  }, [isOpen, authenticated]);

  useEffect(() => {
    if (isOpen) {
      // Обновляем счетчик непрочитанных при открытии чата
      updateUnreadCount();
      if (messages.length > 0) {
        scrollToBottom();
        // Помечаем сообщения как прочитанные при открытии
        if (chat && unreadCount > 0) {
          markAsRead();
        }
      }
    }
  }, [isOpen, messages, chat, unreadCount]);

  const loadChat = async () => {
    try {
      const data = await chatService.getUserChat();
      setChat(data.chat);
      setMessages(data.messages || []);
      setLoading(false);
      // Обновляем счетчик непрочитанных после загрузки чата
      await updateUnreadCount();
    } catch (error) {
      console.error('Error loading chat:', error);
      setLoading(false);
    }
  };

  const updateUnreadCount = async () => {
    try {
      const data = await chatService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error getting unread count:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markAsRead = async () => {
    if (!chat) return;
    try {
      await chatService.markAsRead(chat._id);
      const socket = getSocket();
      if (socket) {
        socket.emit('mark-read', { chatId: chat._id });
      }
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;
    
    setSending(true);
    const socket = getSocket();
    
    try {
      const chatId = chat ? chat._id : null;
      socket.emit('send-message', { chatId, text: messageText });
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Функция для проверки, нужно ли показывать разделитель даты
  const shouldShowDateDivider = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.timestamp || currentMessage.createdAt);
    const previousDate = new Date(previousMessage.timestamp || previousMessage.createdAt);
    
    const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const previousDateOnly = new Date(previousDate.getFullYear(), previousDate.getMonth(), previousDate.getDate());
    
    return currentDateOnly.getTime() !== previousDateOnly.getTime();
  };

  // Функция для рендеринга сообщений с разделителями дат
  const renderMessagesWithDates = () => {
    if (messages.length === 0) return null;

    return messages.map((message, index) => {
      const previousMessage = index > 0 ? messages[index - 1] : null;
      const showDateDivider = shouldShowDateDivider(message, previousMessage);

      return (
        <React.Fragment key={message._id}>
          {showDateDivider && (
            <div className="support-chat-date-divider">
              <span>{formatDate(message.timestamp || message.createdAt)}</span>
            </div>
          )}
          <ChatMessage
            message={message}
            isOwn={message.from === 'user'}
          />
        </React.Fragment>
      );
    });
  };

  // Не показываем на странице логина
  if (location.pathname === '/login' || !authenticated) {
    return null;
  }

  return (
    <>
      {/* Кнопка открытия/закрытия чата */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="support-chat-button"
        title={isOpen ? "Close support chat" : "Open support chat"}
        style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 99999 }}
      >
        💬
        {unreadCount > 0 && (
          <span className="support-chat-badge">{unreadCount}</span>
        )}
      </button>

      {/* Модальное окно чата */}
      {isOpen && (
        <>
          <div className="support-chat-overlay" onClick={() => setIsOpen(false)}></div>
          <div className="support-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="support-chat-header">
              <h3>Support</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="support-chat-close"
              >
                ×
              </button>
            </div>

            <div className="support-chat-messages">
              {loading ? (
                <div className="support-chat-loading">Loading...</div>
              ) : messages.length === 0 ? (
                <div className="support-chat-empty">
                  No messages yet. Write to us and we'll respond!
                </div>
              ) : (
                renderMessagesWithDates()
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="support-chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="support-chat-input"
                disabled={sending}
              />
              <button
                type="submit"
                className="support-chat-send"
                disabled={sending || !messageText.trim()}
              >
                {sending ? '...' : '→'}
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}

export default SupportChat;
