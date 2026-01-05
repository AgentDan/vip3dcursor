// Получаем базовый URL API из переменных окружения
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000';

// Функция для получения полного URL файла
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  // Если путь уже полный URL, возвращаем как есть
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  // Иначе добавляем базовый URL
  return `${API_BASE_URL}${filePath}`;
};

