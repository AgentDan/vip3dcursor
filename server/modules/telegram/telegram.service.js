import chatService from '../chat/chat.service.js';

/**
 * Сервис для работы с Telegram ботом
 * Обеспечивает синхронизацию между Telegram и веб-чатом
 */
class TelegramService {
  constructor(io) {
    this.io = io;
  }

  /**
   * Отправляет уведомление админу в Telegram о новом сообщении от пользователя
   */
  async notifyAdminAboutNewMessage(chat, message) {
    // Этот метод будет вызываться из telegram.bot.js
    // Возвращаем форматированное сообщение для Telegram
    const chatInfo = `📩 <b>Новое сообщение от пользователя</b>\n\n`;
    const userInfo = `👤 <b>Пользователь:</b> ${this.escapeHtml(chat.username)}\n`;
    const chatIdInfo = `🆔 <b>Chat ID:</b> <code>${chat._id}</code>\n`;
    const messageText = `💬 <b>Сообщение:</b>\n${this.escapeHtml(message.text)}\n`;
    const timestamp = `⏰ ${new Date(message.timestamp).toLocaleString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    })}\n`;
    
    const formattedMessage = `${chatInfo}${userInfo}${chatIdInfo}\n${messageText}\n${timestamp}\n\n<b>Для ответа используйте:</b>\n<code>/reply ${chat._id} ваш ответ</code>`;
    
    return formattedMessage;
  }

  /**
   * Экранирование HTML для безопасной отправки в Telegram
   */
  escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Обрабатывает ответ админа из Telegram
   * Сохраняет сообщение в MongoDB и отправляет пользователю через Socket.IO
   */
  async handleAdminReply(chatId, text, telegramMessageId = null) {
    try {
      // Сохраняем сообщение через chatService
      const message = await chatService.sendMessage(chatId, text, 'admin');
      
      // Получаем информацию о чате
      const { chat } = await chatService.getChatHistory(chatId);
      
      // Отправляем сообщение пользователю через Socket.IO
      if (chat && chat.userId) {
        const userId = chat.userId._id ? chat.userId._id.toString() : chat.userId.toString();
        this.io.to(`user:${userId}`).emit('new-message', { message, chat });
      }
      
      // Помечаем сообщения пользователя как прочитанные
      await chatService.markAsRead(chatId, 'user');
      
      return { success: true, message };
    } catch (error) {
      console.error('Error handling admin reply from Telegram:', error);
      throw error;
    }
  }

  /**
   * Форматирует список чатов для Telegram
   */
  formatChatsList(chats) {
    if (!chats || chats.length === 0) {
      return '📭 Нет активных чатов';
    }

    let message = `📋 <b>Список чатов (${chats.length}):</b>\n\n`;
    
    chats.forEach((chat, index) => {
      const status = chat.status === 'active' ? '✅' : chat.status === 'pending' ? '⏳' : '❌';
      const unreadCount = chat.unreadCount || 0;
      const unreadBadge = unreadCount > 0 ? ` 🔴(${unreadCount})` : '';
      
      message += `${index + 1}. ${status} <b>${this.escapeHtml(chat.username)}</b>${unreadBadge}\n`;
      message += `   🆔 ID: <code>${chat._id}</code>\n`;
      message += `   📊 Статус: ${chat.status}\n`;
      if (chat.lastMessageAt) {
        message += `   ⏰ Последнее: ${new Date(chat.lastMessageAt).toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })}\n`;
      }
      message += `   👁️ <code>/chat ${chat._id}</code>\n\n`;
    });

    return message;
  }

  /**
   * Форматирует историю чата для Telegram
   */
  formatChatHistory(chat, messages) {
    if (!messages || messages.length === 0) {
      return `💬 <b>Чат с ${this.escapeHtml(chat.username)}</b>\n\n📭 Нет сообщений\n\n<b>Для ответа:</b>\n<code>/reply ${chat._id} ваш ответ</code>`;
    }

    let message = `💬 <b>Чат с ${this.escapeHtml(chat.username)}</b>\n`;
    message += `🆔 ID: <code>${chat._id}</code>\n`;
    message += `📊 Всего сообщений: ${messages.length}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    messages.forEach((msg) => {
      const sender = msg.from === 'admin' ? '👨‍💼 <b>Админ</b>' : `👤 <b>${this.escapeHtml(chat.username)}</b>`;
      const time = new Date(msg.timestamp).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      message += `${sender} (${time}):\n${this.escapeHtml(msg.text)}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `<b>Для ответа используйте:</b>\n<code>/reply ${chat._id} ваш ответ</code>`;

    return message;
  }

  /**
   * Получает список чатов с непрочитанными сообщениями
   */
  async getChatsWithUnread() {
    try {
      const chats = await chatService.getAllChats();
      
      // Для каждого чата получаем количество непрочитанных сообщений
      const chatsWithUnread = await Promise.all(
        chats.map(async (chat) => {
          const unreadCount = await chatService.getUnreadCount(chat._id, 'user');
          return {
            ...chat.toObject(),
            unreadCount
          };
        })
      );

      return chatsWithUnread.filter(chat => chat.unreadCount > 0);
    } catch (error) {
      console.error('Error getting chats with unread:', error);
      throw error;
    }
  }
}

export default TelegramService;
