import TelegramBot from 'node-telegram-bot-api';
import chatService from '../chat/chat.service.js';
import TelegramService from './telegram.service.js';

let bot = null;
let telegramService = null;
let ioInstance = null;
let isInitializing = false;
let restartTimeout = null;
let restartAttempts = 0;
const MAX_RESTART_ATTEMPTS = 3;

/**
 * Остановка существующего бота
 */
const stopExistingBot = async (token) => {
  // Отменяем запланированный перезапуск, если он есть
  if (restartTimeout) {
    clearTimeout(restartTimeout);
    restartTimeout = null;
  }

  if (bot) {
    try {
      console.log('🛑 Останавливаю предыдущий экземпляр Telegram бота...');
      bot.stopPolling();
      // Даем время на завершение polling
      await new Promise(resolve => setTimeout(resolve, 1000));
      bot = null;
      console.log('✅ Предыдущий экземпляр Telegram бота остановлен');
    } catch (error) {
      console.warn('⚠️  Ошибка при остановке предыдущего бота:', error.message);
      bot = null;
    }
  }

  // Дополнительно: пытаемся остановить polling через Telegram API напрямую
  if (token) {
    try {
      const tempBot = new TelegramBot(token, { polling: false });
      // Удаляем webhook, если он установлен (на всякий случай)
      await tempBot.deleteWebHook({ drop_pending_updates: true });
      // Останавливаем любые активные getUpdates
      await tempBot.stopPolling();
      console.log('✅ Telegram API очищен от предыдущих подключений');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      // Игнорируем ошибки, если нет активных подключений
      console.log('ℹ️  Telegram API уже свободен');
    }
  }
};

/**
 * Инициализация Telegram бота
 */
export const initTelegramBot = async (io) => {
  // Предотвращаем множественные одновременные инициализации
  if (isInitializing) {
    console.log('⏳ Инициализация бота уже выполняется, пропускаю...');
    return bot;
  }

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

  isInitializing = true;

  try {
    // Останавливаем существующий бот, если он есть
    await stopExistingBot(token);
    
    // Дополнительная задержка для гарантии освобождения ресурсов
    await new Promise(resolve => setTimeout(resolve, 3000)); // Увеличена до 3 секунд

    // Создаем бота БЕЗ polling сначала
    bot = new TelegramBot(token, { polling: false });
    telegramService = new TelegramService(io);
    ioInstance = io;

    // Проверяем доступность бота через API
    try {
      const botInfo = await bot.getMe();
      console.log(`🤖 Бот доступен: @${botInfo.username}`);
    } catch (error) {
      console.error('❌ Ошибка при проверке бота:', error.message);
      throw error;
    }

    // Убеждаемся, что webhook не установлен
    try {
      await bot.deleteWebHook({ drop_pending_updates: true });
      console.log('✅ Webhook очищен');
    } catch (error) {
      console.log('ℹ️  Webhook уже очищен или не был установлен');
    }

    // Регистрация обработчиков команд (до запуска polling)
    setupBotCommands(bot, telegramService);

    // Подключение к событиям Socket.IO для уведомлений
    setupSocketIOListeners(io, bot, telegramService);

    // Теперь запускаем polling отдельно
    console.log('🔄 Запускаю polling...');
    bot.startPolling({
      restart: false, // Отключаем автоматический перезапуск
      polling: {
        interval: 1000,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    });

    console.log('✅ Telegram бот инициализирован');
    console.log(`📱 Admin Chat ID: ${adminChatId}`);

    // Сбрасываем счетчик попыток при успешной инициализации
    restartAttempts = 0;
    
    return bot;
  } catch (error) {
    console.error('❌ Ошибка инициализации Telegram бота:', error);
    bot = null;
    return null;
  } finally {
    isInitializing = false;
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
  bot.on('polling_error', async (error) => {
    console.error('❌ Telegram bot polling error:', error.message);
    if (error.code === 'ETELEGRAM') {
      if (error.message.includes('409') || error.message.includes('Conflict')) {
        console.error('   ⚠️  Конфликт: другой экземпляр бота уже запущен');
        
        // Проверяем количество попыток перезапуска
        if (restartAttempts >= MAX_RESTART_ATTEMPTS) {
          console.error(`   ❌ Достигнут лимит попыток перезапуска (${MAX_RESTART_ATTEMPTS})`);
          console.error('   💡 ОСТАНОВИТЕ ВСЕ ПРОЦЕССЫ СЕРВЕРА ВРУЧНУЮ И ПЕРЕЗАПУСТИТЕ');
          console.error('   💡 Выполните: Get-Process node | Stop-Process -Force');
          return;
        }

        // Отменяем предыдущий таймаут перезапуска, если он есть
        if (restartTimeout) {
          clearTimeout(restartTimeout);
          restartTimeout = null;
        }

        restartAttempts++;
        console.error(`   🔄 Попытка перезапуска ${restartAttempts}/${MAX_RESTART_ATTEMPTS}`);
        console.error('   💡 Решение: остановите все процессы сервера и перезапустите');
        console.error('   🔄 Пытаюсь остановить текущий polling...');
        
        // Пытаемся остановить текущий polling и перезапустить через 10 секунд
        try {
          const token = process.env.TELEGRAM_BOT_TOKEN;
          if (bot) {
            bot.stopPolling();
            bot = null;
            console.log('🛑 Остановлен polling из-за конфликта.');
          }
          
          // Останавливаем через API
          if (token) {
            await stopExistingBot(token);
          }
          
          console.log('⏳ Ожидание 10 секунд перед перезапуском...');
          
          // Перезапускаем бота через 10 секунд (увеличено для гарантии освобождения)
          restartTimeout = setTimeout(async () => {
            if (ioInstance && !isInitializing) {
              console.log('🔄 Перезапускаю Telegram бота...');
              await initTelegramBot(ioInstance);
            }
            restartTimeout = null;
          }, 10000);
        } catch (err) {
          console.error('Ошибка при остановке polling:', err);
          console.error('⚠️  Перезапустите сервер вручную');
        }
      } else {
        console.error('   Проверьте правильность TELEGRAM_BOT_TOKEN');
      }
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

/**
 * Остановить бота (для graceful shutdown)
 */
export const stopTelegramBot = async () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  await stopExistingBot(token);
};
