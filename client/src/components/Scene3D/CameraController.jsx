import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Компонент для автоматического центрирования камеры на модели
 * Оптимизирован: центрирует камеру только один раз при загрузке новой модели
 */
export function CameraController({ gltf }) {
  const { camera } = useThree();
  const gltfSceneRef = useRef(null);

  useEffect(() => {
    if (!gltf || !gltf.scene) return;

    // Проверяем, изменилась ли сцена (новая модель загружена)
    if (gltfSceneRef.current === gltf.scene) {
      return; // Камера уже центрирована для этой модели
    }

    gltfSceneRef.current = gltf.scene;

    const box = new THREE.Box3().setFromObject(gltf.scene);
    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2;

    camera.position.set(center.x, center.y, center.z + distance);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
  }, [gltf, camera]);

  return null;
}

