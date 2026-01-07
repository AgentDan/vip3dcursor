import { useEffect, useRef, useState, Suspense } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
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
      // Если параметров нет, устанавливаем светлый фон по умолчанию
      if (gl?.domElement) {
        const canvas = gl.domElement;
        canvas.style.background = '#f3f4f6'; // gray-100 в Tailwind - очень светлый
        canvas.style.backgroundColor = '#f3f4f6';
        canvas.style.setProperty('background-color', '#f3f4f6', 'important');
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

      // Для spotlight - визуализация через SpotLightVisualizer компонент
      if (param.type === 'spotlight') {
        // Spotlight обрабатывается отдельно в SpotLightVisualizer
        return;
      }

      // Для camera - обрабатывается через CameraParamsController
      if (param.type === 'camera') {
        // Camera обрабатывается отдельно в CameraParamsController
        return;
      }

      // Для orbitcontrols - обрабатывается через OrbitControlsController
      if (param.type === 'orbitcontrols') {
        // OrbitControls обрабатывается отдельно в OrbitControlsController
        return;
      }

      // Для fog - применяем туман к сцене
      if (param.type === 'fog') {
        applyFog(scene, param);
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
        // НО: если intensity = 0, устанавливаем минимальное значение (0.01),
        // чтобы сцена не стала полностью черной
        if (gl) {
          const exposure = hdriConfig.intensity > 0 ? hdriConfig.intensity : 0.01;
          gl.toneMappingExposure = exposure;
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
    case 'spotlight':
      // Spotlight визуализируется через SpotLightVisualizer компонент
      // Здесь можно применить дополнительные параметры, если нужно
      break;
    case 'fog':
      applyFog(threeScene, param);
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

/**
 * Применяет параметры тумана
 */
function applyFog(threeScene, param) {
  if (!threeScene) return;

  // Если туман отключен, удаляем его
  if (param.enabled === false) {
    threeScene.fog = null;
    return;
  }

  // Получаем цвет тумана
  let fogColor = new THREE.Color();
  if (param.color) {
    if (typeof param.color === 'string') {
      fogColor.set(param.color);
    } else if (Array.isArray(param.color) && param.color.length === 3) {
      fogColor.setRGB(param.color[0] / 255, param.color[1] / 255, param.color[2] / 255);
    } else {
      fogColor.set(0xcccccc); // Серый по умолчанию
    }
  } else {
    fogColor.set(0xcccccc); // Серый по умолчанию
  }

  // Определяем тип тумана
  const fogType = param.fogType || 'linear';

  if (fogType === 'exponential') {
    // Экспоненциальный туман (FogExp2)
    const density = param.density !== undefined ? Number(param.density) : 0.00025;
    
    if (threeScene.fog && threeScene.fog.isFogExp2) {
      // Обновляем существующий экспоненциальный туман
      threeScene.fog.color.copy(fogColor);
      threeScene.fog.density = density;
    } else {
      // Создаем новый экспоненциальный туман
      threeScene.fog = new THREE.FogExp2(fogColor, density);
    }
  } else {
    // Линейный туман (Fog)
    const near = param.near !== undefined ? Number(param.near) : 1;
    const far = param.far !== undefined ? Number(param.far) : 100;
    
    if (threeScene.fog && threeScene.fog.isFog) {
      // Обновляем существующий линейный туман
      threeScene.fog.color.copy(fogColor);
      threeScene.fog.near = near;
      threeScene.fog.far = far;
    } else {
      // Создаем новый линейный туман
      threeScene.fog = new THREE.Fog(fogColor, near, far);
    }
  }
}

