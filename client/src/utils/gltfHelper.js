/**
 * Утилиты для работы с GLTF данными
 * Преобразует данные GLTF в удобный формат для работы с мешами и материалами
 */

/**
 * Создает helper объект из GLTF данных для быстрого доступа к мешам и материалам
 * @param {Object} gltfData - Данные GLTF из useGLTF
 * @returns {{meshesMap: Object, materialsMap: Object, scenes: Array}} Helper объект
 */
export function buildGltfHelper(gltfData) {
  if (!gltfData) {
    return {
      meshesMap: {},
      materialsMap: {},
      scenes: []
    };
  }

  // Создаем карту мешей из nodes
  const meshesMap = {};
  if (gltfData.nodes) {
    Object.keys(gltfData.nodes).forEach(key => {
      const node = gltfData.nodes[key];
      if (node && (node.type === 'Mesh' || node.isMesh)) {
        meshesMap[key] = node;
      }
    });
  }

  // Создаем карту материалов
  const materialsMap = {};
  if (gltfData.materials) {
    Object.keys(gltfData.materials).forEach(key => {
      materialsMap[key] = gltfData.materials[key];
    });
  }

  // Получаем сцены
  const scenes = gltfData.scenes || [];

  return {
    meshesMap,
    materialsMap,
    scenes
  };
}

