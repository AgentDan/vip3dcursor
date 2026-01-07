/**
 * Утилиты для работы с мешами 3D моделей
 */

/**
 * Собирает все меши из объекта сцены рекурсивно
 * @param {THREE.Object3D} object - Объект сцены
 * @param {Array} meshes - Массив для накопления мешей
 * @returns {Array<{name: string, object: THREE.Mesh}>} Массив мешей с их именами
 */
export function collectMeshes(object, meshes = []) {
  if (object.isMesh) {
    const meshName = object.name || 'unnamed';
    if (!meshes.find(m => m.name === meshName)) {
      meshes.push({ name: meshName, object });
    }
  }

  if (object.children) {
    object.children.forEach(child => {
      collectMeshes(child, meshes);
    });
  }

  return meshes;
}

/**
 * Группирует меши по правилам:
 * - Меши, начинающиеся с "Default" → defaultMeshes (всегда видимы)
 * - Первая цифра в названии = группа
 * - Вторая цифра в названии = объект
 * - Меши с одинаковой первой и второй цифрой объединяются в один объект
 * 
 * @param {string[]} meshNames - Массив названий мешей
 * @returns {{defaultMeshes: string[], groups: Object}} Структура с дефолтными мешами и группами
 */
export function groupMeshes(meshNames) {
  const groups = {};
  const defaultMeshes = [];

  meshNames.forEach(meshName => {
    // Проверяем, является ли меш дефолтным (начинается с "Default")
    if (meshName.toLowerCase().startsWith('default')) {
      defaultMeshes.push(meshName);
      return;
    }

    // Ищем число в названии меша (например, "11.1" -> "11")
    const digitMatch = meshName.match(/(\d+)/);
    if (digitMatch) {
      const numberStr = digitMatch[1];

      // Если число содержит минимум 2 цифры
      if (numberStr.length >= 2) {
        const firstDigit = numberStr[0]; // Первая цифра = группа
        const secondDigit = numberStr[1]; // Вторая цифра = объект
        const groupNum = firstDigit;
        const objectKey = `${firstDigit}${secondDigit}`; // Ключ объекта (например, "11")

        if (!groups[groupNum]) {
          groups[groupNum] = {};
        }

        if (!groups[groupNum][objectKey]) {
          groups[groupNum][objectKey] = [];
        }

        // Добавляем меш к объекту (объект может содержать несколько мешей с разными материалами)
        groups[groupNum][objectKey].push(meshName);
      } else {
        // Если только одна цифра, используем её как группу, объект = 0
        const groupNum = numberStr[0];
        if (!groups[groupNum]) {
          groups[groupNum] = {};
        }
        const objectKey = `${groupNum}0`;
        if (!groups[groupNum][objectKey]) {
          groups[groupNum][objectKey] = [];
        }
        groups[groupNum][objectKey].push(meshName);
      }
    }
  });

  // Преобразуем структуру в формат для UI
  // groups[groupNum] = { "11": ["11.1", "11.2"], "12": ["12.1"] }
  // -> groups[groupNum] = [{ key: "11", meshes: ["11.1", "11.2"], label: "Объект 11" }, ...]
  const formattedGroups = {};
  Object.keys(groups).forEach(groupNum => {
    formattedGroups[groupNum] = Object.entries(groups[groupNum])
      .sort(([a], [b]) => a.localeCompare(b)) // Сортируем объекты по ключу
      .map(([objectKey, meshes]) => ({
        key: objectKey,
        meshes: meshes,
        label: `Объект ${objectKey}`
      }));
  });

  return { defaultMeshes, groups: formattedGroups };
}

