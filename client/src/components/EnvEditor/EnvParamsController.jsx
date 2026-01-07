import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';

/**
 * Компонент для применения env-параметров к 3D сцене в реальном времени
 * Оптимизирован для производительности
 */
export function EnvParamsController({ gltf, envParams }) {
  const { gl, scene } = useThree();
  const paramsRef = useRef({});
  const appliedParamsRef = useRef({});
  const [hdriConfig, setHdriConfig] = useState(null);

  useEffect(() => {
    if (!gltf?.scene || !envParams || envParams.length === 0) {
      // Если параметров нет, сбрасываем background и HDRI
      if (gl?.domElement) {
        const canvas = gl.domElement;
        canvas.style.background = '';
        canvas.style.backgroundColor = '';
        canvas.style.setProperty('background-color', '', 'important');
      }
      setHdriConfig(null);
      return;
    }

    // Применяем параметры к сцене
    envParams.forEach((param, index) => {
      if (!param || !param.type) return;

      const paramKey = `${param.type}_${index}`;

      // Для background ВСЕГДА применяем изменения без проверки
      if (param.type === 'background') {
        applyBackground(gl, param);
        // Не сохраняем в appliedParamsRef для background, чтобы всегда применялось
        return;
      }

      // Для environment обрабатываем HDRI - ВСЕГДА применяем изменения
      if (param.type === 'environment') {
        // Формируем путь к HDRI файлу
        let hdriPath = null;
        if (param.file) {
          const hdriFile = param.file;
          if (hdriFile.startsWith('http://') || hdriFile.startsWith('https://')) {
            // Полный URL
            hdriPath = hdriFile;
          } else if (hdriFile.startsWith('/')) {
            // Абсолютный путь от корня - преобразуем в относительный
            const fileName = hdriFile.split('/').pop();
            hdriPath = `./img/${fileName}`;
          } else if (hdriFile.startsWith('./')) {
            // Уже относительный путь
            hdriPath = hdriFile;
          } else {
            // Просто имя файла или путь без слеша в начале
            const fileName = hdriFile.split('/').pop();
            hdriPath = `./img/${fileName}`;
          }
        }
        
        // Обновляем конфигурацию HDRI при каждом изменении
        const newConfig = {
          file: hdriPath,
          intensity: param.intensity !== undefined ? Number(param.intensity) : 1.0,
          background: param.background !== undefined ? param.background : true
        };
        
        // Проверяем, изменилась ли конфигурация
        const configChanged = !hdriConfig || 
          hdriConfig.file !== newConfig.file ||
          Math.abs((hdriConfig.intensity || 1.0) - newConfig.intensity) > 0.0001 ||
          hdriConfig.background !== newConfig.background;
        
        if (configChanged) {
          setHdriConfig(newConfig);
        }
        return;
      }

      // Для остальных типов проверяем изменения
      const lastApplied = appliedParamsRef.current[paramKey];

      // Для остальных типов проверяем изменения
      let hasChanged = !lastApplied;
      if (!hasChanged) {
        // Проверяем изменения в ключевых полях
        const keysToCheck = Object.keys(param);
        for (const key of keysToCheck) {
          const currentValue = param[key];
          const lastValue = lastApplied[key];
          
          // Для чисел с плавающей точкой используем приблизительное сравнение
          if (typeof currentValue === 'number' && typeof lastValue === 'number') {
            if (Math.abs(currentValue - lastValue) > 0.0001) {
              hasChanged = true;
              break;
            }
          } else if (currentValue !== lastValue) {
            hasChanged = true;
            break;
          }
        }
      }

      if (hasChanged) {
        applyParamToScene(gltf.scene, gl, scene, param);
        appliedParamsRef.current[paramKey] = { ...param };
      }
    });
  }, [gltf, envParams, gl, scene]);

  // Применяем интенсивность HDRI
  useEffect(() => {
    if (hdriConfig && hdriConfig.intensity !== undefined) {
      // Используем requestAnimationFrame для применения после рендера
      requestAnimationFrame(() => {
        if (scene.environment) {
          if (scene.environment.intensity !== undefined) {
            scene.environment.intensity = hdriConfig.intensity;
          }
        }
        // Также управляем через toneMappingExposure
        if (gl) {
          gl.toneMappingExposure = hdriConfig.intensity;
        }
      });
    }
  }, [hdriConfig, scene, gl]);

  return (
    <>
      {hdriConfig && hdriConfig.file && (
        <Suspense fallback={null}>
          <Environment
            key={`${hdriConfig.file}-${hdriConfig.intensity}-${hdriConfig.background}`}
            files={hdriConfig.file}
            background={hdriConfig.background !== false}
          />
        </Suspense>
      )}
    </>
  );
}

/**
 * Применяет параметр к 3D сцене в зависимости от типа
 */
function applyParamToScene(gltfScene, gl, threeScene, param) {
  switch (param.type) {
    case 'background':
      applyBackground(gl, param);
      break;
    case 'light':
      applyLight(gltfScene, param);
      break;
    case 'material':
      applyMaterial(gltfScene, param);
      break;
    case 'camera':
      applyCamera(threeScene, param);
      break;
    case 'environment':
      applyEnvironment(threeScene, param);
      break;
    default:
      // Применяем общие параметры, если они есть
      applyGenericParams(gltfScene, param);
  }
}

/**
 * Применяет параметры фона
 */
function applyBackground(gl, param) {
  // gl.domElement - это canvas элемент
  const canvas = gl?.domElement;
  
  if (!canvas) {
    return;
  }

  // Если background отключен
  if (param.enabled === false) {
    canvas.style.background = 'transparent';
    canvas.style.backgroundColor = 'transparent';
    canvas.style.setProperty('background-color', 'transparent', 'important');
    return;
  }

  // Получаем значения RGB (по умолчанию: red=255, green=0, blue=0)
  const red = param.red !== undefined ? Number(param.red) : 255;
  const green = param.green !== undefined ? Number(param.green) : 0;
  const blue = param.blue !== undefined ? Number(param.blue) : 0;
  
  // Получаем intensity (по умолчанию 1.0)
  // intensity применяется как множитель яркости цвета
  const intensity = param.intensity !== undefined ? Number(param.intensity) : 1.0;

  // Применяем intensity как множитель яркости
  // Если intensity = 0, то цвет черный
  // Если intensity = 1, то цвет без изменений
  // Если intensity > 1, то цвет становится ярче (но ограничиваем до 255)
  const r = Math.round(red * intensity);
  const g = Math.round(green * intensity);
  const b = Math.round(blue * intensity);

  // Ограничиваем значения от 0 до 255
  const clampedR = Math.min(255, Math.max(0, r));
  const clampedG = Math.min(255, Math.max(0, g));
  const clampedB = Math.min(255, Math.max(0, b));

  const finalColor = `rgb(${clampedR}, ${clampedG}, ${clampedB})`;

  // Принудительно обновляем background через все возможные способы
  canvas.style.background = finalColor;
  canvas.style.backgroundColor = finalColor;
  canvas.style.setProperty('background-color', finalColor, 'important');
  
  // Также пробуем установить через setAttribute для гарантии
  canvas.setAttribute('style', `background-color: ${finalColor} !important; background: ${finalColor} !important;`);
}

/**
 * Применяет параметры освещения
 */
function applyLight(gltfScene, param) {
  if (!gltfScene) return;

  gltfScene.traverse((child) => {
    if (child.isLight) {
      // Проверяем соответствие по имени или индексу
      const matches = 
        (param.name && child.name === param.name) ||
        (param.index !== undefined && child.userData?.envIndex === param.index);

      if (matches) {
        if (param.intensity !== undefined) {
          child.intensity = param.intensity;
        }
        if (param.color !== undefined) {
          if (typeof param.color === 'string') {
            child.color.setHex(parseInt(param.color.replace('#', ''), 16));
          } else if (Array.isArray(param.color) && param.color.length === 3) {
            child.color.setRGB(param.color[0] / 255, param.color[1] / 255, param.color[2] / 255);
          }
        }
        if (param.position && Array.isArray(param.position)) {
          child.position.set(param.position[0], param.position[1], param.position[2]);
        }
      }
    }
  });
}

/**
 * Применяет параметры материалов
 */
function applyMaterial(gltfScene, param) {
  if (!gltfScene) return;

  gltfScene.traverse((child) => {
    if (child.isMesh && child.material) {
      const material = Array.isArray(child.material) ? child.material[0] : child.material;
      
      const matches = 
        (param.materialName && material.name === param.materialName) ||
        (param.nodeName && child.name === param.nodeName);

      if (matches) {
        if (param.opacity !== undefined) {
          material.opacity = param.opacity;
          material.transparent = param.opacity < 1;
        }
        if (param.color !== undefined) {
          if (typeof param.color === 'string') {
            material.color.setHex(parseInt(param.color.replace('#', ''), 16));
          } else if (Array.isArray(param.color) && param.color.length === 3) {
            material.color.setRGB(param.color[0] / 255, param.color[1] / 255, param.color[2] / 255);
          }
        }
        if (param.roughness !== undefined) {
          material.roughness = param.roughness;
        }
        if (param.metalness !== undefined) {
          material.metalness = param.metalness;
        }
        if (param.emissive !== undefined) {
          if (Array.isArray(param.emissive) && param.emissive.length === 3) {
            material.emissive.setRGB(
              param.emissive[0] / 255,
              param.emissive[1] / 255,
              param.emissive[2] / 255
            );
          }
        }
      }
    }
  });
}

/**
 * Применяет параметры камеры
 */
function applyCamera(threeScene, param) {
  // Камера управляется через useThree hook, но можно применить некоторые параметры
  // Например, через scene.camera если доступно
}


/**
 * Применяет общие параметры к узлам сцены
 */
function applyGenericParams(gltfScene, param) {
  if (!gltfScene || !param.nodeName) return;

  gltfScene.traverse((child) => {
    if (child.name === param.nodeName) {
      if (param.position && Array.isArray(param.position)) {
        child.position.set(param.position[0], param.position[1], param.position[2]);
      }
      if (param.rotation && Array.isArray(param.rotation)) {
        child.rotation.set(
          THREE.MathUtils.degToRad(param.rotation[0]),
          THREE.MathUtils.degToRad(param.rotation[1]),
          THREE.MathUtils.degToRad(param.rotation[2])
        );
      }
      if (param.scale && Array.isArray(param.scale)) {
        child.scale.set(param.scale[0], param.scale[1], param.scale[2]);
      }
      if (param.visible !== undefined) {
        child.visible = param.visible;
      }
    }
  });
}

