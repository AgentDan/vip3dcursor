import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';

/**
 * Компонент для загрузки GLTF через useGLTF
 * Должен быть внутри Canvas для правильной работы useGLTF
 * Оптимизирован: использует useRef для onLoad, чтобы избежать лишних пересчетов
 */
export function GltfLoader({ url, onLoad }) {
  if (!url) {
    return null;
  }

  const gltfData = useGLTF(url);
  const onLoadRef = useRef(onLoad);
  const gltfDataRef = useRef(null);

  // Обновляем ref при изменении onLoad
  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  // Вызываем onLoad только при изменении gltfData
  useEffect(() => {
    if (gltfData && gltfData !== gltfDataRef.current) {
      gltfDataRef.current = gltfData;
      if (onLoadRef.current) {
        onLoadRef.current(gltfData);
      }
    }
  }, [gltfData]);

  return null;
}

