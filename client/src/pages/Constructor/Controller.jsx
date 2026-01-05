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

// Функция для сбора названий всех мешей
function collectMeshNames(object, names = []) {
  if (object.isMesh) {
    const meshName = object.name || 'unnamed';
    if (!names.includes(meshName)) {
      names.push(meshName);
    }
  }
  
  if (object.children) {
    object.children.forEach(child => {
      collectMeshNames(child, names);
    });
  }
  
  return names;
}

// Компонент для рендеринга GLTF сцены
function GltfScene({ gltf, schema, runtime }) {
  const schemaAppliedRef = useRef(false);
  
  useEffect(() => {
    if (gltf && gltf.scene) {
      // Собираем только названия мешей
      const meshNames = collectMeshNames(gltf.scene);
      console.log("Меши модели:", meshNames);
      
      // Вычисляем bounding box для центрирования камеры
      if (gltf.scene.children.length > 0) {
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim * 2;
      }
    }
  }, [gltf]);
  
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

const Controller = ({ gltf, runtime, currentPath, onGltfLoad }) => {
  const [schema, setSchema] = useState(null);
  const [schemaLoading, setSchemaLoading] = useState(false);

  const gltfSceneRef = useRef(null);
  
  useEffect(() => {
    // Проверяем, изменился ли gltf.scene (сравниваем по ссылке)
    if (gltf && gltf.scene && gltfSceneRef.current !== gltf.scene) {
      gltfSceneRef.current = gltf.scene;
      
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
  }, [gltf, runtime]);

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