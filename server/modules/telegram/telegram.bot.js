import TelegramBot from 'node-telegram-bot-api';
import chatService from '../chat/chat.service.js';
import TelegramService from './telegram.service.js';

let bot = null;
let telegramService = null;
let ioInstance = null;

/**
 * Инициализация Telegram бота
 */
export const initTelegramBot = (io) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN не установлен. Telegram бот не будет работать.');
    return null;
  }

  if (!adminChatId) {
    console.warn('⚠️  TELEGRAM_ADMIN_CHAT_ID не установлен. Telegram бот не будет работать.');
    return null;
  }

  try {
    bot = new TelegramBot(token, { polling: true });
    telegramService = new TelegramService(io);
    ioInstance = io;

    console.log('✅ Telegram бот инициализирован');
    console.log(`📱 Admin Chat ID: ${adminChatId}`);

    // Регистрация обработчиков команд
    setupBotCommands(bot, telegramService);

    // Подключение к событиям Socket.IO для уведомлений
    setupSocketIOListeners(io, bot, telegramService);

    return bot;
  } catch (error) {
    console.error('❌ Ошибка инициализации Telegram бота:', error);
    return null;
  }
};

/**
 * Настройка команд бота
 */
function setupBotCommands(bot, telegramService) {
  // Команда /start
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (chatId.toString() !== adminChatId) {
      bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
      return;
    }

    const welcomeMessage = `👋 Добро пожаловать в систему управления чатами!\n\n` +
      `Доступные команды:\n` +
      `/chats - Список всех чатов\n` +
      `/chats_unread - Список чатов с непрочитанными сообщениями\n` +
      `/chat <chatId> - История конкретного чата\n` +
      `/reply <chatId> <сообщение> - Ответить на чат\n` +
      `/help - Показать эту справку`;

    bot.sendMessage(chatId, welcomeMessage);
  });

  // Команда /help
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (chatId.toString() !== adminChatId) {
      bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
      return;
    }

    const helpMessage = `📖 Справка по командам:\n\n` +
      `/chats - Показать все чаты\n` +
      `/chats_unread - Показать только чаты с непрочитанными сообщениями\n` +
      `/chat <chatId> - Показать историю чата\n` +
      `Пример: /chat 507f1f77bcf86cd799439011\n\n` +
      `/reply <chatId> <сообщение> - Ответить пользователю\n` +
      `Пример: /reply 507f1f77bcf86cd799439011 Привет! Как дела?\n\n` +
      `/help - Показать эту справку`;

    bot.sendMessage(chatId, helpMessage);
  });

  // Команда /chats - список всех чатов
  bot.onText(/\/chats/, async (msg) => {
    const chatId = msg.chat.id;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (chatId.toString() !== adminChatId) {
      bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
      return;
    }

    try {
      const chats = await chatService.getAllChats();
      const formattedList = telegramService.formatChatsList(chats);
      bot.sendMessage(chatId, formattedList, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Error getting chats:', error);
      bot.sendMessage(chatId, '❌ Ошибка при получении списка чатов');
    }
  });

  // Команда /chats_unread - список чатов с непрочитанными
  bot.onText(/\/chats_unread/, async (msg) => {
    const chatId = msg.chat.id;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (chatId.toString() !== adminChatId) {
      bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
      return;
    }

    try {
      const chatsWithUnread = await telegramService.getChatsWithUnread();
      if (chatsWithUnread.length === 0) {
        bot.sendMessage(chatId, '✅ Нет чатов с непрочитанными сообщениями');
      } else {
        const formattedList = telegramService.formatChatsList(chatsWithUnread);
        bot.sendMessage(chatId, formattedList, { parse_mode: 'HTML' });
      }
    } catch (error) {
      console.error('Error getting unread chats:', error);
      bot.sendMessage(chatId, '❌ Ошибка при получении списка чатов');
    }
  });

  // Команда /chat <chatId> - история чата
  bot.onText(/\/chat (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (chatId.toString() !== adminChatId) {
      bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
      return;
    }

    const targetChatId = match[1];

    try {
      const { chat, messages } = await chatService.getChatHistory(targetChatId);
      const formattedHistory = telegramService.formatChatHistory(chat, messages);
      bot.sendMessage(chatId, formattedHistory, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Error getting chat history:', error);
      bot.sendMessage(chatId, `❌ Ошибка при получении истории чата: ${error.message}`);
    }
  });

  // Команда /reply <chatId> <message> - ответить на чат
  bot.onText(/\/reply (.+?) (.+)/s, async (msg, match) => {
    const chatId = msg.chat.id;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (chatId.toString() !== adminChatId) {
      bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
      return;
    }

    const targetChatId = match[1];
    const replyText = match[2].trim();

    if (!replyText) {
      bot.sendMessage(chatId, '❌ Сообщение не может быть пустым');
      return;
    }

    try {
      await telegramService.handleAdminReply(targetChatId, replyText, msg.message_id);
      bot.sendMessage(chatId, `✅ Ответ отправлен пользователю\n\n💬 Ваш ответ: ${replyText}`);
    } catch (error) {
      console.error('Error sending reply:', error);
      bot.sendMessage(chatId, `❌ Ошибка при отправке ответа: ${error.message}`);
    }
  });

  // Обработка ошибок
  bot.on('polling_error', (error) => {
    console.error('❌ Telegram bot polling error:', error.message);
    if (error.code === 'ETELEGRAM') {
      console.error('   Проверьте правильность TELEGRAM_BOT_TOKEN');
    }
  });

  // Обработка успешного подключения
  bot.on('webhook_error', (error) => {
    console.error('❌ Telegram bot webhook error:', error.message);
  });

  // Обработка неизвестных команд
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    // Игнорируем сообщения не от админа
    if (chatId.toString() !== adminChatId) {
      return;
    }

    // Игнорируем команды (они обрабатываются выше)
    if (msg.text && msg.text.startsWith('/')) {
      return;
    }

    // Если это просто текст без команды, предлагаем помощь
    bot.sendMessage(chatId, '❓ Неизвестная команда. Используйте /help для справки.');
  });
}

/**
 * Настройка слушателей Socket.IO для уведомлений в Telegram
 */
function setupSocketIOListeners(io, bot, telegramService) {
  if (!bot || !telegramService) return;

  // Слушаем событие отправки сообщения от пользователя
  // Это событие будет эмититься из chat.socket.js
  io.on('connection', (socket) => {
    // Обработка уже происходит в chat.socket.js
    // Здесь мы можем добавить дополнительную логику если нужно
  });
}

/**
 * Отправляет уведомление админу в Telegram о новом сообщении
 * Вызывается из chat.socket.js
 */
export const notifyAdminInTelegram = async (chat, message) => {
  if (!bot || !telegramService) return;

  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) return;

  try {
    const notification = await telegramService.notifyAdminAboutNewMessage(chat, message);
    await bot.sendMessage(adminChatId, notification, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
};

/**
 * Получить экземпляр бота (для использования в других модулях)
 */
export const getTelegramBot = () => {
  return bot;
};
