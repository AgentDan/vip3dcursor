import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { GltfLoader } from './GltfLoader';
import { CameraController } from './CameraController';
import { MeshVisibilityController } from './MeshVisibilityController';
import { GltfScene } from './GltfScene';
import { EnvParamsController } from '../EnvEditor/EnvParamsController';

/**
 * Основной компонент 3D сцены
 * Управляет Canvas и рендерингом 3D модели
 */
export function Scene3D({
  currentPath,
  gltf,
  gltfHelper,
  selectedMeshes,
  meshGroups,
  schema,
  onGltfLoad,
  envParams
}) {
  const showEmptyCanvas = !gltf || !gltf.scene;
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  useEffect(() => {
    // Сбрасываем флаг потери контекста при изменении пути
    setContextLost(false);
  }, [currentPath]);

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
        {contextLost && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white/90 rounded-lg p-6 text-center shadow-xl">
              <p className="text-gray-800 mb-2">WebGL контекст потерян</p>
              <p className="text-gray-600 text-sm">Восстановление...</p>
            </div>
          </div>
        )}
        <Canvas
          key={canvasKey}
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ 
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
            alpha: false,
            depth: true,
            stencil: false,
            failIfMajorPerformanceCaveat: false
          }}
          onCreated={({ gl }) => {
            // Обработка потери контекста WebGL
            const canvas = gl.domElement;
            
            const contextLostHandler = (event) => {
              event.preventDefault();
              setContextLost(true);
            };
            
            const contextRestoredHandler = () => {
              setContextLost(false);
              // Принудительно пересоздаем Canvas для восстановления
              setCanvasKey(prev => prev + 1);
            };
            
            canvas.addEventListener('webglcontextlost', contextLostHandler);
            canvas.addEventListener('webglcontextrestored', contextRestoredHandler);
            
            // Очистка при размонтировании
            return () => {
              canvas.removeEventListener('webglcontextlost', contextLostHandler);
              canvas.removeEventListener('webglcontextrestored', contextRestoredHandler);
            };
          }}
          style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          {/* Загрузчик GLTF */}
          {currentPath && (
            <GltfLoader key={currentPath} url={currentPath} onLoad={onGltfLoad} />
          )}

          {/* Рендерим модель только если она загружена */}
          {!showEmptyCanvas && (
            <>
              <CameraController gltf={gltf} />
              <MeshVisibilityController
                gltf={gltf}
                selectedMeshes={selectedMeshes || {}}
                meshGroups={meshGroups}
              />
              <GltfScene gltf={gltf} schema={schema} gltfHelper={gltfHelper} />
              {envParams && envParams.length > 0 && (
                <EnvParamsController gltf={gltf} envParams={envParams} />
              )}
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
}

