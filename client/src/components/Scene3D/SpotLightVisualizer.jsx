import { useEffect, useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Компонент для визуализации spotlight из env параметров
 * Показывает Position, Target и конус света
 */
export function SpotLightVisualizer({ envParams }) {
  const { scene } = useThree();
  
  // Создаем карту spotlight по имени для быстрого доступа и обновления
  const lightsMapRef = useRef(new Map());
  const prevParamsStringRef = useRef('');

  // Создаем строковое представление spotlight параметров для отслеживания изменений
  // Используем более точное сравнение с округлением чисел
  const spotlightParamsString = useMemo(() => {
    if (!envParams || !Array.isArray(envParams)) return '';
    const spotlights = envParams
      .filter(p => p.type === 'spotlight')
      .map(p => ({
        name: p.name,
        intensity: p.intensity !== undefined ? Number(p.intensity).toFixed(3) : '1.000',
        onoff: p.onoff,
        position: p.position,
        target: p.target,
        color: p.color,
        visible: p.visible
      }));
    return JSON.stringify(spotlights);
  }, [envParams]);

  // Отдельный useEffect для обновления intensity существующих spotlight
  // Используем requestAnimationFrame для гарантии обновления после рендера
  useEffect(() => {
    if (!envParams || !Array.isArray(envParams)) return;
    if (spotlightParamsString === prevParamsStringRef.current) return;
    
    prevParamsStringRef.current = spotlightParamsString;

    requestAnimationFrame(() => {
      envParams.forEach((param) => {
        if (param.type !== 'spotlight' || !param.name) return;

        const existing = lightsMapRef.current.get(param.name);
        if (!existing || !existing.light) return;

        // visible управляет только источником света (intensity)
        let intensity = param.intensity !== undefined ? Number(param.intensity) : 1;
        const visible = param.visible !== undefined ? param.visible : true;
        
        if (!visible) {
          intensity = 0;
        }

        // Принудительно обновляем intensity
        existing.light.intensity = intensity;
        
        // onoff управляет только видимостью визуальных элементов (линий направления)
        const onoff = param.onoff !== undefined ? param.onoff : true;
        const shouldShowLines = onoff;
        
        if (existing.helper) {
          existing.helper.visible = shouldShowLines;
          if (existing.helper.update) {
            existing.helper.update();
          }
        }
        if (existing.positionSphere) {
          existing.positionSphere.visible = shouldShowLines;
        }
        if (existing.targetCone) {
          existing.targetCone.visible = shouldShowLines;
        }
        if (existing.line) {
          existing.line.visible = shouldShowLines;
        }
      });
    });
  }, [spotlightParamsString, envParams]);

  useEffect(() => {
    if (!envParams || !Array.isArray(envParams)) return;

    // Создаем карту текущих spotlight параметров
    const currentSpotlights = new Map();
    envParams.forEach((param, index) => {
      if (param.type === 'spotlight' && param.name) {
        currentSpotlights.set(param.name, { param, index });
      }
    });

    // Обновляем существующие spotlight или создаем новые
    currentSpotlights.forEach(({ param, index }) => {
      // visible НЕ удаляет spotlight, только управляет intensity
      // spotlight удаляется только если его нет в envParams
      
      const existing = lightsMapRef.current.get(param.name);
      
      if (existing) {
        // Обновляем существующий spotlight
        const position = param.position || [0, 0, 0];
        const target = param.target || [0, 0, 0];
        let intensity = param.intensity !== undefined ? Number(param.intensity) : 1;
        const onoff = param.onoff !== undefined ? param.onoff : true;
        const visible = param.visible !== undefined ? param.visible : true;
        
        // visible управляет только источником света (intensity)
        // onoff НЕ влияет на intensity
        if (!visible) {
          intensity = 0;
        }

        // Обновляем позицию и target
        existing.light.position.set(position[0], position[1], position[2]);
        existing.light.target.position.set(target[0], target[1], target[2]);
        
        // Обновляем intensity (только от visible)
        existing.light.intensity = intensity;
        
        // Обновляем параметры для правильной работы spotlight
        // Убираем decay для более предсказуемого поведения
        if (existing.light.decay !== 0) {
          existing.light.decay = 0;
        }
        // Увеличиваем distance для большей области действия
        if (existing.light.distance !== 1000) {
          existing.light.distance = 1000;
        }

        // Обновляем цвет
        const color = param.color || 'white';
        let lightColor = new THREE.Color();
        if (typeof color === 'string') {
          lightColor.set(color);
        } else if (Array.isArray(color) && color.length === 3) {
          lightColor.setRGB(color[0] / 255, color[1] / 255, color[2] / 255);
        } else {
          lightColor.set('white');
        }
        existing.light.color.copy(lightColor);

        // Обновляем визуальные объекты
        if (existing.positionSphere) {
          existing.positionSphere.position.set(position[0], position[1], position[2]);
          existing.positionSphere.material.color.copy(lightColor);
        }
        if (existing.targetCone) {
          existing.targetCone.position.set(target[0], target[1], target[2]);
          existing.targetCone.material.color.copy(lightColor);
        }
        if (existing.line) {
          existing.line.geometry.setFromPoints([
            new THREE.Vector3(position[0], position[1], position[2]),
            new THREE.Vector3(target[0], target[1], target[2])
          ]);
          existing.line.material.color.copy(lightColor);
        }
        if (existing.helper) {
          existing.helper.color = lightColor;
        }

        // onoff управляет только видимостью визуальных элементов (линий направления)
        // visible НЕ влияет на видимость линий
        const shouldShowLines = onoff;
        
        if (existing.helper) {
          existing.helper.visible = shouldShowLines;
        }
        if (existing.positionSphere) {
          existing.positionSphere.visible = shouldShowLines;
        }
        if (existing.targetCone) {
          existing.targetCone.visible = shouldShowLines;
        }
        if (existing.line) {
          existing.line.visible = shouldShowLines;
        }
      } else {
        // Создаем новый spotlight
        const position = param.position || [0, 0, 0];
        const target = param.target || [0, 0, 0];
        let intensity = param.intensity !== undefined ? Number(param.intensity) : 1;
        const color = param.color || 'white';
        const onoff = param.onoff !== undefined ? param.onoff : true;
        const visible = param.visible !== undefined ? param.visible : true;

        // visible управляет только источником света (intensity)
        // onoff НЕ влияет на intensity
        if (!visible) {
          intensity = 0;
        }

        // Создаем SpotLight
        // НОРМАЛЬНЫЕ ЗНАЧЕНИЯ INTENSITY для SpotLight:
        // - 0.5 - 2.0: слабое/среднее освещение (рекомендуется)
        // - 2.0 - 5.0: яркое освещение
        // - 5.0+: очень яркое освещение
        // При decay=0 и distance=1000, значения 0.5-2.0 работают нормально
        const spotLight = new THREE.SpotLight();
        spotLight.position.set(position[0], position[1], position[2]);
        spotLight.target.position.set(target[0], target[1], target[2]);
        spotLight.intensity = intensity;
        spotLight.angle = Math.PI / 6; // 30 градусов (угол конуса света)
        spotLight.penumbra = 0.5; // Плавное затухание на краях конуса (0-1)
        // Убираем decay (затухание) для более предсказуемого поведения
        // decay=0 означает, что интенсивность постоянна на любом расстоянии
        spotLight.decay = 0; // Без затухания - интенсивность постоянна на любом расстоянии
        // Увеличиваем distance для большей области действия
        // ЕДИНИЦЫ ИЗМЕРЕНИЯ в Three.js:
        // - Это условные единицы (не метры, не миллиметры)
        // - Обычно 1 единица = 1 метр (зависит от того, как создана модель)
        // - distance = 1000 означает 1000 единиц, не 1000 миллиметров
        // - В GLTF cube расстояние между Position и Target ≈ 4.857 единиц
        spotLight.distance = 1000; // Максимальное расстояние действия света в единицах Three.js (увеличено с 100)

        // Устанавливаем цвет
        let lightColor = new THREE.Color();
        if (typeof color === 'string') {
          lightColor.set(color);
        } else if (Array.isArray(color) && color.length === 3) {
          lightColor.setRGB(color[0] / 255, color[1] / 255, color[2] / 255);
        } else {
          lightColor.set('white');
        }
        spotLight.color.copy(lightColor);

        // Добавляем свет в сцену
        scene.add(spotLight);
        scene.add(spotLight.target);

        // onoff управляет только видимостью визуальных элементов (линий направления)
        // visible НЕ влияет на видимость линий
        const shouldShowLines = onoff;

        // Создаем SpotLightHelper
        const helper = new THREE.SpotLightHelper(spotLight, lightColor);
        helper.visible = shouldShowLines;
        scene.add(helper);

        // Создаем значок для Position
        const positionGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const positionMaterial = new THREE.MeshBasicMaterial({ 
          color: lightColor,
          transparent: true,
          opacity: 0.8
        });
        const positionSphere = new THREE.Mesh(positionGeometry, positionMaterial);
        positionSphere.position.set(position[0], position[1], position[2]);
        positionSphere.visible = shouldShowLines;
        scene.add(positionSphere);

        // Создаем значок для Target
        const targetGeometry = new THREE.ConeGeometry(0.08, 0.15, 8);
        const targetMaterial = new THREE.MeshBasicMaterial({ 
          color: lightColor,
          transparent: true,
          opacity: 0.6
        });
        const targetCone = new THREE.Mesh(targetGeometry, targetMaterial);
        targetCone.position.set(target[0], target[1], target[2]);
        
        const direction = new THREE.Vector3()
          .subVectors(
            new THREE.Vector3(position[0], position[1], position[2]),
            new THREE.Vector3(target[0], target[1], target[2])
          )
          .normalize();
        
        const lookAtTarget = new THREE.Vector3(
          target[0] + direction.x,
          target[1] + direction.y,
          target[2] + direction.z
        );
        targetCone.lookAt(lookAtTarget);
        targetCone.rotateX(Math.PI);
        targetCone.visible = shouldShowLines;
        scene.add(targetCone);

        // Создаем линию
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(position[0], position[1], position[2]),
          new THREE.Vector3(target[0], target[1], target[2])
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: lightColor,
          transparent: true,
          opacity: 0.3,
          linewidth: 2
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.visible = shouldShowLines;
        scene.add(line);

        // Сохраняем в карту
        lightsMapRef.current.set(param.name, {
          light: spotLight,
          helper,
          positionSphere,
          targetCone,
          line
        });
      }
    });

    // Удаляем spotlight, которых больше нет в параметрах
    lightsMapRef.current.forEach((existing, name) => {
      if (!currentSpotlights.has(name)) {
        if (existing.light && existing.light.parent) existing.light.parent.remove(existing.light);
        if (existing.light.target && existing.light.target.parent) existing.light.target.parent.remove(existing.light.target);
        if (existing.helper && existing.helper.parent) existing.helper.parent.remove(existing.helper);
        if (existing.positionSphere && existing.positionSphere.parent) existing.positionSphere.parent.remove(existing.positionSphere);
        if (existing.targetCone && existing.targetCone.parent) existing.targetCone.parent.remove(existing.targetCone);
        if (existing.line && existing.line.parent) existing.line.parent.remove(existing.line);
        
        if (existing.light && existing.light.dispose) existing.light.dispose();
        if (existing.helper && existing.helper.dispose) existing.helper.dispose();
        if (existing.positionSphere?.geometry) existing.positionSphere.geometry.dispose();
        if (existing.positionSphere?.material) existing.positionSphere.material.dispose();
        if (existing.targetCone?.geometry) existing.targetCone.geometry.dispose();
        if (existing.targetCone?.material) existing.targetCone.material.dispose();
        if (existing.line?.geometry) existing.line.geometry.dispose();
        if (existing.line?.material) existing.line.material.dispose();
        
        lightsMapRef.current.delete(name);
      }
    });

    // Очистка при размонтировании
    return () => {
      lightsMapRef.current.forEach((existing) => {
        if (existing.light && existing.light.parent) existing.light.parent.remove(existing.light);
        if (existing.light.target && existing.light.target.parent) existing.light.target.parent.remove(existing.light.target);
        if (existing.helper && existing.helper.parent) existing.helper.parent.remove(existing.helper);
        if (existing.positionSphere && existing.positionSphere.parent) existing.positionSphere.parent.remove(existing.positionSphere);
        if (existing.targetCone && existing.targetCone.parent) existing.targetCone.parent.remove(existing.targetCone);
        if (existing.line && existing.line.parent) existing.line.parent.remove(existing.line);
        
        if (existing.light && existing.light.dispose) existing.light.dispose();
        if (existing.helper && existing.helper.dispose) existing.helper.dispose();
        if (existing.positionSphere?.geometry) existing.positionSphere.geometry.dispose();
        if (existing.positionSphere?.material) existing.positionSphere.material.dispose();
        if (existing.targetCone?.geometry) existing.targetCone.geometry.dispose();
        if (existing.targetCone?.material) existing.targetCone.material.dispose();
        if (existing.line?.geometry) existing.line.geometry.dispose();
        if (existing.line?.material) existing.line.material.dispose();
      });
      lightsMapRef.current.clear();
    };
  }, [envParams, scene]);

  // Обновляем helpers и intensity каждый кадр
  useFrame(() => {
    if (!envParams || !Array.isArray(envParams)) return;

    lightsMapRef.current.forEach(({ light, helper }, name) => {
      // Обновляем helper
      if (helper && helper.update && typeof helper.update === 'function') {
        helper.update();
      }

      // Обновляем intensity и видимость из текущих параметров
      const param = envParams.find(p => p.type === 'spotlight' && p.name === name);
      if (param && light) {
        let intensity = param.intensity !== undefined ? Number(param.intensity) : 1;
        const visible = param.visible !== undefined ? param.visible : true;
        const onoff = param.onoff !== undefined ? param.onoff : true;
        
        // visible управляет только источником света (intensity)
        // onoff НЕ влияет на intensity
        if (!visible) {
          intensity = 0;
        }

        // Принудительно обновляем intensity каждый кадр
        if (light.intensity !== intensity) {
          light.intensity = intensity;
        }

        // onoff управляет только видимостью визуальных элементов (линий направления)
        // visible НЕ влияет на видимость линий
        const existing = lightsMapRef.current.get(name);
        if (existing) {
          const shouldShowLines = onoff;
          
          if (existing.helper) {
            existing.helper.visible = shouldShowLines;
          }
          if (existing.positionSphere) {
            existing.positionSphere.visible = shouldShowLines;
          }
          if (existing.targetCone) {
            existing.targetCone.visible = shouldShowLines;
          }
          if (existing.line) {
            existing.line.visible = shouldShowLines;
          }
        }
      }
    });
  });

  return null; // Компонент не рендерит JSX, только управляет Three.js объектами
}

