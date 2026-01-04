import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { getUsername } from '../utils/jwt.utils';
import uploadService from '../services/upload.service';

function Model({ url }) {
  const { scene } = useGLTF(url);
  useEffect(() => {
    return () => {
      // Cleanup: revoke object URL when component unmounts
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);
  
  return <primitive object={scene} scale={1} />;
}

function Model3D() {
  const [modelUrl, setModelUrl] = useState(null);
  const [userFiles, setUserFiles] = useState([]);
  const [loading, setLoading] = useState(true);
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
      } catch (err) {
        setError(err.message || 'Failed to load files');
        console.error('Error loading files:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFiles();
  }, [username]);

  const handleModelSelect = (file) => {
    // Сбрасываем URL перед установкой нового, чтобы принудительно перерендерить компонент
    setModelUrl(null);
    setSelectedModel(file);
    
    // Используем setTimeout для гарантии, что состояние сброшено перед установкой нового URL
    setTimeout(() => {
      const fullUrl = `http://127.0.0.1:3000${file.url}?t=${Date.now()}`;
      setModelUrl(fullUrl);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-10 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-5xl font-light text-white tracking-tight mb-2 flex items-center">
                <svg className="w-10 h-10 mr-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                3D Model Viewer
              </h1>
              <p className="text-gray-400 text-sm font-light mt-2">
                {username ? `View your .gltf or .glb files (${username})` : 'View your .gltf or .glb files'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/home')}
                className="px-5 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 hover:shadow-md transition-all font-light text-sm uppercase tracking-wider border border-white/20 cursor-pointer"
              >
                Home
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mr-3"></div>
              <span className="text-white">Loading your models...</span>
            </div>
          ) : error ? (
            <div className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm font-medium border border-red-500/30">
              {error}
            </div>
          ) : userFiles.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-white text-lg font-semibold mb-3">Your 3D Models ({userFiles.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                {userFiles.map((file, index) => (
                  <button
                    key={`${file.username}-${file.filename}-${index}`}
                    onClick={() => handleModelSelect(file)}
                    className={`px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg border-2 transition-all cursor-pointer text-left ${
                      selectedModel?.filename === file.filename && selectedModel?.username === file.username
                        ? 'border-blue-400 bg-blue-500/20'
                        : 'border-white/20'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-500/20 rounded-lg p-2 mr-3">
                        <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{file.filename}</p>
                        <p className="text-gray-400 text-xs">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 px-4 py-3 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm font-medium border border-yellow-500/30">
              No 3D models found. Upload models through the admin panel.
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          {!modelUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-white text-xl font-semibold mb-2">No 3D Model Selected</p>
                <p className="text-gray-300">
                  {userFiles.length > 0 
                    ? 'Select a model from the list above to view it' 
                    : 'No 3D models available. Upload models through the admin panel.'}
                </p>
              </div>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                    <p className="text-white text-lg">Loading 3D model...</p>
                  </div>
                </div>
              }
            >
              <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                gl={{ antialias: true }}
              >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />
                <Suspense fallback={null}>
                  <Model key={modelUrl} url={modelUrl} />
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
    </div>
  );
}

export default Model3D;

