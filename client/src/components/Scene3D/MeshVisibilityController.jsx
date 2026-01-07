import { useEffect, useMemo, useRef } from 'react';
import { collectMeshes } from '../../utils/meshUtils';

/**
 * Компонент для управления видимостью мешей
 * Использует useMemo для вычисления видимости и применяет изменения к объектам сцены
 * Примечание: Изменение object.visible - это нормальная практика в Three.js,
 * так как это свойство объекта сцены, которое должно изменяться динамически
 * 
 * Оптимизация: Меши кешируются один раз при загрузке GLTF, чтобы избежать
 * дорогостоящего traverse сцены при каждом изменении видимости
 */
export function MeshVisibilityController({ gltf, selectedMeshes, meshGroups }) {
  const meshesRef = useRef([]);

  // Собираем меши ОДИН раз при загрузке GLTF
  // Это критично для производительности на больших сценах (200-500 мешей)
  useEffect(() => {
    if (!gltf?.scene) {
      meshesRef.current = [];
      return;
    }
    meshesRef.current = collectMeshes(gltf.scene);
  }, [gltf]);

  // Вычисляем видимость мешей на основе выбранных объектов
  // Не зависит от gltf, так как gltf не используется в вычислениях
  const visibilityMap = useMemo(() => {
    if (!meshGroups) return {};

    const visibility = {};
    const { defaultMeshes, groups } = meshGroups;

    // Дефолтные меши всегда видимы
    defaultMeshes.forEach(name => {
      visibility[name] = true;
    });

    // Для остальных мешей проверяем выбор в группах
    Object.entries(groups).forEach(([groupNum, objects]) => {
      const selectedKey = selectedMeshes[groupNum];
      objects.forEach(obj => {
        const visible = obj.key === selectedKey;
        obj.meshes.forEach(name => {
          visibility[name] = visible;
        });
      });
    });

    return visibility;
  }, [selectedMeshes, meshGroups]);

  // Применяем видимость к мешам в сцене
  // Используем кешированные меши вместо повторного traverse
  useEffect(() => {
    const meshes = meshesRef.current;
    if (!meshes.length) return;

    meshes.forEach(({ name, object }) => {
      if (visibilityMap[name] !== undefined) {
        object.visible = visibilityMap[name];
      }
    });
  }, [visibilityMap]);

  return null;
}

