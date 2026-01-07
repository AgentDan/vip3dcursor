import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Компонент для применения env-параметров к 3D сцене в реальном времени
 * Оптимизирован для производительности
 */
export function EnvParamsController({ gltf, envParams }) {
  const { gl, scene } = useThree();
  const paramsRef = useRef({});
  const appliedParamsRef = useRef({});

  useEffect(() => {
    if (!gltf?.scene || !envParams || envParams.length === 0) return;

    // Применяем параметры к сцене
    envParams.forEach((param, index) => {
      if (!param || !param.type) return;

      const paramKey = `${param.type}_${index}`;
      const lastApplied = appliedParamsRef.current[paramKey];

      // Проверяем, изменились ли параметры
      const hasChanged = !lastApplied || JSON.stringify(param) !== JSON.stringify(lastApplied);

      if (hasChanged) {
        applyParamToScene(gltf.scene, gl, scene, param);
        appliedParamsRef.current[paramKey] = { ...param };
      }
    });
  }, [gltf, envParams, gl, scene]);

  return null;
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
  if (!gl?.domElement || param.enabled === false) {
    if (gl?.domElement) {
      gl.domElement.style.background = 'transparent';
    }
    return;
  }

  const red = param.red ?? 255;
  const green = param.green ?? 0;
  const blue = param.blue ?? 0;
  const intensity = param.intensity ?? 1.0;

  const r = Math.round(red * intensity);
  const g = Math.round(green * intensity);
  const b = Math.round(blue * intensity);

  const clampedR = Math.min(255, Math.max(0, r));
  const clampedG = Math.min(255, Math.max(0, g));
  const clampedB = Math.min(255, Math.max(0, b));

  const finalColor = `rgb(${clampedR}, ${clampedG}, ${clampedB})`;

  gl.domElement.style.background = finalColor;
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
 * Применяет параметры окружения
 */
function applyEnvironment(threeScene, param) {
  if (param.intensity !== undefined && threeScene.environment) {
    // Управление яркостью окружения
    if (threeScene.environment.intensity !== undefined) {
      threeScene.environment.intensity = param.intensity;
    }
  }
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

