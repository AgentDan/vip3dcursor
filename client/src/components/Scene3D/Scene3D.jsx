import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { GltfLoader } from './GltfLoader';
import { CameraController } from './CameraController';
import { MeshVisibilityController } from './MeshVisibilityController';
import { GltfScene } from './GltfScene';

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
  onGltfLoad
}) {
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
          gl={{ 
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance"
          }}
          onCreated={({ gl }) => {
            // Обработка потери контекста WebGL
            const canvas = gl.domElement;
            
            canvas.addEventListener('webglcontextlost', (event) => {
              event.preventDefault();
              console.warn('WebGL context lost - attempting to restore...');
            });
            
            canvas.addEventListener('webglcontextrestored', () => {
              console.log('WebGL context restored successfully');
            });
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

