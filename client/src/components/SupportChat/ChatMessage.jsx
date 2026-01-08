import './SupportChat.css';

function ChatMessage({ message, isOwn }) {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`support-chat-message ${isOwn ? 'own' : 'other'}`}>
      <div className="support-chat-message-content">
        <div className="support-chat-message-text">{message.text}</div>
        <div className="support-chat-message-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
}

export default ChatMessage;
