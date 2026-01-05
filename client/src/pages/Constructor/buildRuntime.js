// Функция для построения runtime из gltf (результат useGLTF)
// useGLTF возвращает { nodes, materials, scenes, scene }
export const buildRuntime = (gltfData) => {
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
};

