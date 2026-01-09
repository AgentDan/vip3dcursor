import { useState, useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../../services/socket.service';
import chatService from '../../services/chat.service';
import { isAuthenticated } from '../../utils/jwt.utils';
import ChatMessage from './ChatMessage';
import './SupportChat.css';

function SupportChat() {
  const authenticated = isAuthenticated();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

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
  }, [isOpen]);

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

  if (!authenticated) {
    return null;
  }

  return (
    <>
      {/* Кнопка открытия чата */}
      <button
        onClick={() => setIsOpen(true)}
        className="support-chat-button"
        title="Написать в поддержку"
      >
        💬
        {unreadCount > 0 && (
          <span className="support-chat-badge">{unreadCount}</span>
        )}
      </button>

      {/* Модальное окно чата */}
      {isOpen && (
        <div className="support-chat-overlay" onClick={() => setIsOpen(false)}>
          <div className="support-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="support-chat-header">
              <h3>Поддержка</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="support-chat-close"
              >
                ×
              </button>
            </div>

            <div className="support-chat-messages">
              {loading ? (
                <div className="support-chat-loading">Загрузка...</div>
              ) : messages.length === 0 ? (
                <div className="support-chat-empty">
                  Нет сообщений. Напишите нам, и мы ответим!
                </div>
              ) : (
                messages.map(message => (
                  <ChatMessage
                    key={message._id}
                    message={message}
                    isOwn={message.from === 'user'}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="support-chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Введите сообщение..."
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
        </div>
      )}
    </>
  );
}

export default SupportChat;
