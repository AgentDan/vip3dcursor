import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { getUsername } from '../utils/jwt.utils';
import uploadService from '../services/upload.service';

function Model({ url, onLoad }) {
  const { scene } = useGLTF(url);
  useEffect(() => {
    return () => {
      // Cleanup: revoke object URL when component unmounts
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);
  
  useEffect(() => {
    if (scene && onLoad) {
      onLoad();
    }
  }, [scene, onLoad]);
  
  return <primitive object={scene} scale={1} />;
}

function Model3D() {
  const [modelUrl, setModelUrl] = useState(null);
  const [userFiles, setUserFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modelLoading, setModelLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const navigate = useNavigate();
  const username = getUsername();

  useEffect(() => {
    const fetchUserFiles = async () => {
      if (!username) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allFiles = await uploadService.getAllFilesWithOwners();
        
        // Фильтруем файлы текущего пользователя и только .gltf/.glb файлы
        const filteredFiles = allFiles.filter(file => 
          file.username === username && 
          (file.filename.endsWith('.gltf') || file.filename.endsWith('.glb'))
        );
        
        setUserFiles(filteredFiles);
        setError('');
        
        // Автоматически выбираем первую модель, если есть файлы
        if (filteredFiles.length > 0) {
          // Всегда выбираем первую модель при загрузке файлов
          const firstFile = filteredFiles[0];
          setSelectedModel(firstFile);
          setModelLoading(true);
          setTimeout(() => {
            const fullUrl = `http://127.0.0.1:3000${firstFile.url}?t=${Date.now()}`;
            setModelUrl(fullUrl);
          }, 50);
        } else {
          // Если файлов нет, сбрасываем выбранную модель
          setSelectedModel(null);
          setModelUrl(null);
        }
      } catch (err) {
        setError(err.message || 'Failed to load files');
        console.error('Error loading files:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFiles();
  }, [username]);

  const getFileNameOnlyLetters = (filename) => {
    // Убираем расширение файла (.gltf, .glb и т.д.)
    const nameWithoutExtension = filename.replace(/\.[^/.]+$/, '');
    // Оставляем только буквы (латинские и кириллические)
    const lettersOnly = nameWithoutExtension.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '');
    return lettersOnly || filename; // Если не осталось букв, возвращаем оригинальное имя
  };

  const handleModelSelect = (file) => {
    // Сбрасываем URL перед установкой нового, чтобы принудительно перерендерить компонент
    setModelUrl(null);
    setSelectedModel(file);
    setModelLoading(true);
    
    // Используем setTimeout для гарантии, что состояние сброшено перед установкой нового URL
    setTimeout(() => {
      const fullUrl = `http://127.0.0.1:3000${file.url}?t=${Date.now()}`;
      setModelUrl(fullUrl);
    }, 50);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Overlay Controls - Top Right */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 flex flex-col items-end gap-2">
        <button
          onClick={() => navigate('/home')}
          className="px-2.5 py-1.5 bg-black/60 backdrop-blur-md text-white rounded border border-white/30 hover:bg-black/80 hover:border-white/50 transition-all font-light text-xs uppercase tracking-wider cursor-pointer whitespace-nowrap"
        >
          Home
        </button>
        {userFiles.length > 0 && !loading && (
          <select
            value={(() => {
              if (!selectedModel || userFiles.length === 0) return 0;
              const index = userFiles.findIndex(f => 
                f.filename === selectedModel.filename && 
                f.username === selectedModel.username
              );
              return index >= 0 ? index : 0;
            })()}
            onChange={(e) => {
              const selectedIndex = parseInt(e.target.value);
              if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < userFiles.length) {
                const selectedFile = userFiles[selectedIndex];
                if (selectedFile) {
                  handleModelSelect(selectedFile);
                }
              }
            }}
            className="px-2 py-1.5 bg-black/60 backdrop-blur-md text-white rounded border border-white/30 outline-none transition-all focus:border-white/50 focus:bg-black/70 font-light text-xs cursor-pointer"
          >
            {userFiles.map((file, index) => (
              <option
                key={`${file.username}-${file.filename}-${index}`}
                value={index}
                className="bg-gray-900 text-white"
              >
                {getFileNameOnlyLetters(file.filename)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <div className="flex items-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white/30 border-t-white mr-3 flex-shrink-0"></div>
            <span className="text-white text-sm font-light">Loading your models...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 px-3 py-2 bg-red-500/80 backdrop-blur-md text-red-100 rounded text-xs font-medium border border-red-400/50">
          {error}
        </div>
      )}

      {userFiles.length === 0 && !loading && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 px-3 py-2 bg-yellow-500/80 backdrop-blur-md text-yellow-100 rounded text-xs font-medium border border-yellow-400/50">
          No 3D models found. Upload models through the admin panel.
        </div>
      )}

      {/* Full Screen Canvas */}
      <div className="absolute inset-0 overflow-hidden">
        {modelLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-white/30 border-t-white mb-3 sm:mb-4"></div>
              <p className="text-white text-base sm:text-xl font-light mb-2">loading 3d model</p>
            </div>
          </div>
        )}
        {!modelUrl ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center px-4">
              <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-white text-lg sm:text-xl font-semibold mb-2">No 3D Model Selected</p>
              <p className="text-gray-300 text-sm sm:text-base">
                {userFiles.length > 0 
                  ? 'Select a model from the dropdown above' 
                  : 'No 3D models available. Upload models through the admin panel.'}
              </p>
            </div>
          </div>
        ) : (
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center px-4">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-white/30 border-t-white mb-3 sm:mb-4"></div>
                    <p className="text-white text-base sm:text-xl font-light mb-2">loading 3d model</p>
                    <p className="text-gray-300 text-xs sm:text-sm font-light">Please wait...</p>
                  </div>
                </div>
              }
            >
              <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                gl={{ antialias: true }}
                style={{ width: '100%', height: '100%' }}
              >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />
                <Suspense fallback={null}>
                  <Model key={modelUrl} url={modelUrl} onLoad={() => setModelLoading(false)} />
                </Suspense>
                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={2}
                  maxDistance={20}
                />
                <Environment preset="sunset" />
              </Canvas>
            </Suspense>
        )}
      </div>
    </div>
  );
}

export default Model3D;

