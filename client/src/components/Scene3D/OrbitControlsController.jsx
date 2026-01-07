import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';

/**
 * Компонент для применения параметров orbitcontrols из envParams в реальном времени
 * Стабильная версия с улучшенной логикой применения параметров
 */
export function OrbitControlsController({ envParams }) {
  const get = useThree((state) => state.get);
  const appliedParamsRef = useRef(null);
  const controlsRef = useRef(null);
  const envParamsRef = useRef(envParams);

  // Обновляем ref при изменении envParams
  envParamsRef.current = envParams;

  // Функция для применения параметров к controls
  const applyParams = (currentControls, orbitParams) => {
    if (!currentControls) return;

    // Проверяем orbitFree
    const isOrbitFree = orbitParams?.orbitFree !== false; // По умолчанию true, если не указано

    if (isOrbitFree) {
      // Если orbitFree = true, снимаем все ограничения
      currentControls.minAzimuthAngle = -Infinity;
      currentControls.maxAzimuthAngle = Infinity;
      currentControls.minPolarAngle = 0;
      currentControls.maxPolarAngle = Math.PI;
      currentControls.enablePan = true;
    } else {
      // Если orbitFree = false, применяем ограничения из параметров
      if (orbitParams) {
        // minAzimuthAngle
        if (orbitParams.minAzimuthAngle !== undefined && !isNaN(orbitParams.minAzimuthAngle)) {
          currentControls.minAzimuthAngle = Number(orbitParams.minAzimuthAngle);
        } else {
          currentControls.minAzimuthAngle = -Infinity;
        }
        
        // maxAzimuthAngle
        if (orbitParams.maxAzimuthAngle !== undefined && !isNaN(orbitParams.maxAzimuthAngle)) {
          currentControls.maxAzimuthAngle = Number(orbitParams.maxAzimuthAngle);
        } else {
          currentControls.maxAzimuthAngle = Infinity;
        }
        
        // minPolarAngle
        if (orbitParams.minPolarAngle !== undefined && !isNaN(orbitParams.minPolarAngle)) {
          const minPolar = Number(orbitParams.minPolarAngle);
          currentControls.minPolarAngle = Math.max(0, Math.min(Math.PI, minPolar));
        } else {
          currentControls.minPolarAngle = 0;
        }
        
        // maxPolarAngle
        if (orbitParams.maxPolarAngle !== undefined && !isNaN(orbitParams.maxPolarAngle)) {
          const maxPolar = Number(orbitParams.maxPolarAngle);
          currentControls.maxPolarAngle = Math.max(0, Math.min(Math.PI, maxPolar));
        } else {
          currentControls.maxPolarAngle = Math.PI;
        }
      } else {
        // Если параметров нет, но orbitFree = false, используем значения по умолчанию
        currentControls.minAzimuthAngle = -Infinity;
        currentControls.maxAzimuthAngle = Infinity;
        currentControls.minPolarAngle = 0;
        currentControls.maxPolarAngle = Math.PI;
      }
      
      // При orbitFree = false панорамирование может быть ограничено
      currentControls.enablePan = true;
    }

    // Обновляем controls
    currentControls.update();
  };

  // Используем useFrame для постоянного применения параметров
  useFrame((state, delta) => {
    // Получаем controls из store через get()
    let currentControls = controlsRef.current;
    
    if (!currentControls) {
      // Пробуем получить controls из store
      try {
        const storeState = get();
        if (storeState && storeState.controls) {
          currentControls = storeState.controls;
          controlsRef.current = currentControls;
        }
      } catch (e) {
        // Игнорируем ошибки
      }
    }
    
    if (!currentControls) {
      return; // Controls еще не готовы
    }

    // Проверяем наличие envParams
    if (!envParamsRef.current || !Array.isArray(envParamsRef.current)) {
      return;
    }

    // Находим параметры orbitcontrols
    const orbitParams = envParamsRef.current.find(p => p.type === 'orbitcontrols');
    
    // Проверяем, изменились ли параметры
    const paramsKey = orbitParams ? JSON.stringify(orbitParams) : 'default';
    
    if (appliedParamsRef.current === paramsKey) {
      return; // Параметры не изменились
    }

    // Применяем параметры
    appliedParamsRef.current = paramsKey;
    applyParams(currentControls, orbitParams);
  });

  return null;
}

