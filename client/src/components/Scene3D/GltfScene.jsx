import { useEffect, useRef } from 'react';

/**
 * Компонент для рендеринга GLTF сцены с применением schema
 * Оптимизирован: schema применяется только один раз при загрузке модели
 */
export function GltfScene({ gltf, schema, gltfHelper }) {
  const schemaAppliedRef = useRef(false);
  const gltfSceneRef = useRef(null);

  if (!gltf || !gltf.scene) {
    return null;
  }

  // Применяем schema ОДИН РАЗ при загрузке новой модели
  useEffect(() => {
    // Проверяем, изменилась ли сцена (новая модель загружена)
    if (gltfSceneRef.current !== gltf.scene) {
      gltfSceneRef.current = gltf.scene;
      schemaAppliedRef.current = false; // Сбрасываем флаг для новой модели
    }

    // Применяем schema только если она есть и еще не применялась для этой модели
    if (!schema || !gltfHelper || !gltf || !gltf.nodes || schemaAppliedRef.current) {
      return;
    }

    // Применяем видимость из schema
    if (schema.visible) {
      Object.keys(schema.visible).forEach(nodeName => {
        const node = gltf.nodes[nodeName];
        if (node) {
          node.visible = schema.visible[nodeName];
        }
      });
    }

    // Применяем материалы из schema
    if (schema.materials) {
      Object.keys(schema.materials).forEach(nodeName => {
        const node = gltf.nodes[nodeName];
        const materialName = schema.materials[nodeName];
        if (node && gltfHelper.materialsMap && gltfHelper.materialsMap[materialName]) {
          node.material = gltfHelper.materialsMap[materialName];
        }
      });
    }

    // Помечаем, что schema применена для этой модели
    schemaAppliedRef.current = true;
  }, [schema, gltfHelper, gltf]); // Зависит от всех, но применяется только один раз благодаря флагу

  return <primitive object={gltf.scene} scale={1} />;
}

