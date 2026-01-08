// Получаем базовый URL API из переменных окружения
// В продакшене используем пустую строку для относительных путей
const isProduction = import.meta.env.PROD;
export const API_BASE_URL = isProduction 
  ? '' // В продакшене используем относительные пути
  : (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000');

// Функция для получения полного URL файла
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  // Если путь уже полный URL, возвращаем как есть
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  // Если путь уже начинается с /, просто добавляем базовый URL (или ничего в продакшене)
  return `${API_BASE_URL}${filePath}`;
};

