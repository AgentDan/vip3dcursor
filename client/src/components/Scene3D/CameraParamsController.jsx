import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Компонент для применения параметров camera из envParams
 * Если объект camera есть в envParams - применяем его параметры (position, target, fov)
 * Если объекта camera нет - не изменяем камеру (CameraController применит автоматическое центрирование)
 */
export function CameraParamsController({ envParams }) {
  const { camera } = useThree();
  const appliedParamsRef = useRef(null);

  useEffect(() => {
    if (!camera || !envParams || !Array.isArray(envParams)) return;

    // Находим параметры camera
    const cameraParams = envParams.find(p => p.type === 'camera');
    
    // Проверяем, изменились ли параметры (включая случай, когда объекта нет)
    const paramsKey = cameraParams ? JSON.stringify(cameraParams) : 'default';
    if (paramsKey === appliedParamsRef.current) {
      return; // Параметры не изменились
    }

    appliedParamsRef.current = paramsKey;

    if (cameraParams) {
      // Если объект camera есть - применяем его параметры
      
      // Применяем position
      if (cameraParams.position && Array.isArray(cameraParams.position) && cameraParams.position.length === 3) {
        camera.position.set(
          Number(cameraParams.position[0]),
          Number(cameraParams.position[1]),
          Number(cameraParams.position[2])
        );
      }

      // Применяем target (lookAt)
      if (cameraParams.target && Array.isArray(cameraParams.target) && cameraParams.target.length === 3) {
        camera.lookAt(
          Number(cameraParams.target[0]),
          Number(cameraParams.target[1]),
          Number(cameraParams.target[2])
        );
      }

      // Применяем FOV
      if (cameraParams.fov !== undefined) {
        const fov = Number(cameraParams.fov);
        if (fov > 0) {
          camera.fov = fov;
        }
      }
    }
    // Если объекта camera нет - не трогаем камеру
    // CameraController применит автоматическое центрирование

    // Обновляем матрицу проекции камеры
    camera.updateProjectionMatrix();
  }, [camera, envParams]);

  return null;
}

