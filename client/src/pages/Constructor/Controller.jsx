import { useEffect, useState, Suspense, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Компонент для загрузки GLTF через useGLTF
// Этот компонент должен быть внутри Canvas для правильной работы useGLTF
function GltfLoader({ url, onLoad }) {
  if (!url) {
    return null;
  }
  
  const gltfData = useGLTF(url);
  
  useEffect(() => {
    if (gltfData && onLoad) {
      onLoad(gltfData);
    }
  }, [gltfData, onLoad]);
  
  return null;
}

// Компонент для центрирования камеры на модели
function CameraController({ gltf }) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (!gltf || !gltf.scene) return;
    
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

// Функция для сбора всех мешей с их объектами
function collectMeshes(object, meshes = []) {
  if (object.isMesh) {
    const meshName = object.name || 'unnamed';
    if (!meshes.find(m => m.name === meshName)) {
      meshes.push({ name: meshName, object });
    }
  }
  
  if (object.children) {
    object.children.forEach(child => {
      collectMeshes(child, meshes);
    });
  }
  
  return meshes;
}

// Функция для группировки мешей
// Первая цифра = группа, вторая цифра = объект
// Меши с одинаковой первой и второй цифрой объединяются в один объект
function groupMeshes(meshNames) {
  const groups = {};
  const defaultMeshes = [];
  
  meshNames.forEach(meshName => {
    // Проверяем, является ли меш дефолтным (начинается с "Default")
    if (meshName.toLowerCase().startsWith('default')) {
      defaultMeshes.push(meshName);
      return;
    }
    
    // Ищем число в названии меша (например, "11.1" -> "11")
    const digitMatch = meshName.match(/(\d+)/);
    if (digitMatch) {
      const numberStr = digitMatch[1];
      
      // Если число содержит минимум 2 цифры
      if (numberStr.length >= 2) {
        const firstDigit = numberStr[0]; // Первая цифра = группа
        const secondDigit = numberStr[1]; // Вторая цифра = объект
        const groupNum = firstDigit;
        const objectKey = `${firstDigit}${secondDigit}`; // Ключ объекта (например, "11")
        
        if (!groups[groupNum]) {
          groups[groupNum] = {};
        }
        
        if (!groups[groupNum][objectKey]) {
          groups[groupNum][objectKey] = [];
        }
        
        // Добавляем меш к объекту (объект может содержать несколько мешей с разными материалами)
        groups[groupNum][objectKey].push(meshName);
      } else {
        // Если только одна цифра, используем её как группу, объект = 0
        const groupNum = numberStr[0];
        if (!groups[groupNum]) {
          groups[groupNum] = {};
        }
        const objectKey = `${groupNum}0`;
        if (!groups[groupNum][objectKey]) {
          groups[groupNum][objectKey] = [];
        }
        groups[groupNum][objectKey].push(meshName);
      }
    }
  });
  
  // Преобразуем структуру в формат для UI
  // groups[groupNum] = { "11": ["11.1", "11.2"], "12": ["12.1"] }
  // -> groups[groupNum] = [{ key: "11", meshes: ["11.1", "11.2"], label: "Объект 11" }, ...]
  const formattedGroups = {};
  Object.keys(groups).forEach(groupNum => {
    formattedGroups[groupNum] = Object.entries(groups[groupNum])
      .sort(([a], [b]) => a.localeCompare(b)) // Сортируем объекты по ключу
      .map(([objectKey, meshes]) => ({
        key: objectKey,
        meshes: meshes,
        label: `Объект ${objectKey}`
      }));
  });
  
  return { defaultMeshes, groups: formattedGroups };
}

// Компонент для управления видимостью мешей
function MeshVisibilityController({ gltf, selectedMeshes }) {
  useEffect(() => {
    if (!gltf || !gltf.scene) return;
    
    // Собираем все меши
    const allMeshes = collectMeshes(gltf.scene);
    
    // Группируем меши
    const meshNames = allMeshes.map(m => m.name);
    const { defaultMeshes, groups } = groupMeshes(meshNames);
    
    // Устанавливаем видимость для всех мешей
    allMeshes.forEach(({ name, object }) => {
      // Дефолтные меши всегда видимы
      if (defaultMeshes.includes(name)) {
        object.visible = true;
        // Также обновляем в gltf.nodes если есть
        if (gltf.nodes && gltf.nodes[name]) {
          gltf.nodes[name].visible = true;
        }
        return;
      }
      
      // Для остальных мешей проверяем, выбран ли объект, к которому они относятся
      let isVisible = false;
      
      // Ищем, к какой группе и объекту относится меш
      for (const [groupNum, objects] of Object.entries(groups)) {
        for (const obj of objects) {
          // Если меш входит в этот объект
          if (obj.meshes.includes(name)) {
            // Проверяем, выбран ли этот объект в группе
            const selectedObjectKey = selectedMeshes[groupNum];
            if (selectedObjectKey === obj.key) {
              // Показываем все меши этого объекта
              isVisible = true;
            }
            break;
          }
        }
        if (isVisible) break;
      }
      
      object.visible = isVisible;
      // Также обновляем в gltf.nodes если есть
      if (gltf.nodes && gltf.nodes[name]) {
        gltf.nodes[name].visible = isVisible;
      }
    });
  }, [gltf, selectedMeshes]);
  
  return null;
}

// Компонент для рендеринга GLTF сцены
function GltfScene({ gltf, schema, runtime }) {
  const schemaAppliedRef = useRef(false);
  
  if (!gltf || !gltf.scene) {
    return null;
  }

  // Применяем schema для управления visible/material
  useEffect(() => {
    if (!schema || !runtime || !gltf || !gltf.nodes) return;
    
    // Применяем только один раз или при изменении schema
    const schemaKey = JSON.stringify(schema);
    if (schemaAppliedRef.current === schemaKey) return;
    schemaAppliedRef.current = schemaKey;

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
        if (node && runtime.materialsMap && runtime.materialsMap[materialName]) {
          node.material = runtime.materialsMap[materialName];
        }
      });
    }
  }, [schema, runtime, gltf]);

  return <primitive object={gltf.scene} scale={1} />;
}

const Controller = ({ gltf, runtime, currentPath, onGltfLoad, selectedMeshes, onMeshesGrouped }) => {
  const [schema, setSchema] = useState(null);
  const [schemaLoading, setSchemaLoading] = useState(false);

  const gltfSceneRef = useRef(null);
  
  useEffect(() => {
    // Проверяем, изменился ли gltf.scene (сравниваем по ссылке)
    if (gltf && gltf.scene && gltfSceneRef.current !== gltf.scene) {
      gltfSceneRef.current = gltf.scene;
      
      // Собираем и группируем меши
      const allMeshes = collectMeshes(gltf.scene);
      const meshNames = allMeshes.map(m => m.name);
      const { defaultMeshes, groups } = groupMeshes(meshNames);
      console.log("Меши модели:", meshNames);
      
      // Передаем информацию о группах в родительский компонент
      if (onMeshesGrouped) {
        onMeshesGrouped({ defaultMeshes, groups });
      }
      
      // Загружаем schema.json если есть gltf
      setSchemaLoading(true);
      // TODO: Заменить на реальный путь к schema.json
      // Можно получать из gltfInfo или из текущего проекта
      fetch('/schema.json')
        .then(res => {
          if (res.ok) {
            return res.json();
          }
          return null;
        })
        .then(data => {
          setSchema(data);
          setSchemaLoading(false);
        })
        .catch(error => {
          setSchemaLoading(false);
        });
    } else if (!gltf || !gltf.scene) {
      gltfSceneRef.current = null;
      setSchema(null);
    }
  }, [gltf, runtime, onMeshesGrouped]);

  // Если GLTF не загружен, показываем пустой Canvas с градиентом
  // Но все равно рендерим Canvas, чтобы GltfLoader мог работать
  const showEmptyCanvas = !gltf || !gltf.scene;

  return (
    <div className="fixed inset-0 w-screen h-screen">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-600 mb-4"></div>
              <p className="text-gray-600">Загрузка 3D модели...</p>
            </div>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ antialias: true }}
          style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          {/* Загрузчик GLTF - работает только когда есть currentPath */}
          {currentPath && (
            <GltfLoader key={currentPath} url={currentPath} onLoad={onGltfLoad} />
          )}
          
          {/* Рендерим модель только если она загружена */}
          {!showEmptyCanvas && (
            <>
              <CameraController gltf={gltf} />
              <MeshVisibilityController gltf={gltf} selectedMeshes={selectedMeshes || {}} />
              <GltfScene gltf={gltf} schema={schema} runtime={runtime} />
            </>
          )}
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={0.1}
            maxDistance={100}
          />
          <Environment preset="sunset" />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Controller;