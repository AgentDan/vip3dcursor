import { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { GltfLoader } from './GltfLoader';
import { CameraController } from './CameraController';
import { MeshVisibilityController } from './MeshVisibilityController';
import { GltfScene } from './GltfScene';
import { EnvParamsController } from '../EnvEditor/EnvParamsController';
import { SpotLightVisualizer } from './SpotLightVisualizer';
import { DescriptionVisualizer } from './DescriptionVisualizer';
import { OrbitControlsController } from './OrbitControlsController';
import { CameraParamsController } from './CameraParamsController';

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
  const glRef = useRef(null);

  useEffect(() => {
    // Сбрасываем флаг потери контекста при изменении пути
    setContextLost(false);
  }, [currentPath]);

  // Устанавливаем светло-серый фон по умолчанию, если нет env параметров для фона
  useEffect(() => {
    if (glRef.current?.domElement) {
      const canvas = glRef.current.domElement;
      // Проверяем, есть ли параметры background в envParams
      const hasBackgroundParam = envParams && envParams.some(p => p.type === 'background');
      
      if (!hasBackgroundParam) {
        // Если нет параметров background, устанавливаем светлый фон по умолчанию
        canvas.style.background = '#f3f4f6'; // gray-100 в Tailwind - очень светлый
        canvas.style.backgroundColor = '#f3f4f6';
      }
      // Если есть параметры background, EnvParamsController установит свой фон
    }
  }, [showEmptyCanvas, envParams]);

  // Вычисляем параметры для OrbitControls из envParams
  const orbitControlsProps = useMemo(() => {
    const orbitParams = envParams && envParams.length > 0 
      ? envParams.find(p => p.type === 'orbitcontrols')
      : null;
    
    const isOrbitFree = orbitParams?.orbitFree !== false;
    
    const props = {
      enablePan: true,
      enableZoom: isOrbitFree, // Зум включен только если orbitFree = true
      enableRotate: true,
      minDistance: 0.1,
      maxDistance: 100
    };
    
    if (orbitParams && !isOrbitFree) {
      // Если orbitFree = false, применяем ограничения и отключаем зум
      props.enableZoom = false;
      if (orbitParams.minAzimuthAngle !== undefined) {
        props.minAzimuthAngle = Number(orbitParams.minAzimuthAngle);
      }
      if (orbitParams.maxAzimuthAngle !== undefined) {
        props.maxAzimuthAngle = Number(orbitParams.maxAzimuthAngle);
      }
      if (orbitParams.minPolarAngle !== undefined) {
        props.minPolarAngle = Number(orbitParams.minPolarAngle);
      }
      if (orbitParams.maxPolarAngle !== undefined) {
        props.maxPolarAngle = Number(orbitParams.maxPolarAngle);
      }
    } else {
      // Если orbitFree = true или параметров нет, без ограничений
      props.enableZoom = true;
      props.minAzimuthAngle = -Infinity;
      props.maxAzimuthAngle = Infinity;
      props.minPolarAngle = 0;
      props.maxPolarAngle = Math.PI;
    }
    
    return props;
  }, [envParams]);
  
  // Ключ для принудительного обновления OrbitControls при изменении параметров
  const orbitControlsKey = useMemo(() => {
    const orbitParams = envParams && envParams.length > 0 
      ? envParams.find(p => p.type === 'orbitcontrols')
      : null;
    return orbitParams ? JSON.stringify(orbitParams) : 'default';
  }, [envParams]);

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
            // Сохраняем ссылку на gl для управления фоном
            glRef.current = gl;
            
            // Обработка потери контекста WebGL
            const canvas = gl.domElement;
            
            // Устанавливаем светлый фон по умолчанию
            canvas.style.background = '#f3f4f6'; // gray-100 в Tailwind - очень светлый
            canvas.style.backgroundColor = '#f3f4f6';
            
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
          style={{ width: '100%', height: '100%', background: '#f3f4f6' }}
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
              <CameraController gltf={gltf} envParams={envParams} />
              <MeshVisibilityController
                gltf={gltf}
                selectedMeshes={selectedMeshes || {}}
                meshGroups={meshGroups}
              />
              <GltfScene gltf={gltf} schema={schema} gltfHelper={gltfHelper} />
              {envParams && envParams.length > 0 && (
                <>
                  <EnvParamsController gltf={gltf} envParams={envParams} />
                  <SpotLightVisualizer 
                    key={JSON.stringify(envParams.filter(p => p.type === 'spotlight'))} 
                    envParams={envParams} 
                  />
                  <DescriptionVisualizer envParams={envParams} />
                  <CameraParamsController envParams={envParams} />
                </>
              )}
            </>
          )}

          <OrbitControls
            key={orbitControlsKey}
            {...orbitControlsProps}
          />
          {/* Environment будет применяться через EnvParamsController, если есть HDRI в env параметрах */}
          {(!envParams || envParams.length === 0 || !envParams.some(p => p.type === 'environment' && p.file)) && (
            <Environment preset="sunset" />
          )}
        </Canvas>
      </Suspense>
    </div>
  );
}

