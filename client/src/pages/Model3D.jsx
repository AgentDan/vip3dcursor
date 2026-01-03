import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
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
  const [error, setError] = useState('');
  const [modelName, setModelName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.gltf') && !file.name.endsWith('.glb')) {
      setError('Please select a .gltf or .glb file');
      return;
    }

    setError('');
    setUploadSuccess(false);

    // Показываем файл локально сразу
    const localUrl = URL.createObjectURL(file);
    setModelUrl(localUrl);
    setModelName(file.name);

    // Загружаем на сервер
    setUploading(true);
    try {
      const result = await uploadService.uploadFile(file);
      setUploadSuccess(true);
      console.log('File uploaded:', result);
      
      // Опционально: можно использовать URL с сервера вместо blob
      // setModelUrl(`http://127.0.0.1:3000${result.file.url}`);
    } catch (err) {
      setError(err.message || 'Failed to upload file to server');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                3D Model Viewer
              </h1>
              <p className="text-gray-300 mt-1">Load and view your .gltf or .glb files</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/home')}
                className="px-5 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all font-medium border border-white/30"
              >
                Home
              </button>
            </div>
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <label className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg cursor-pointer transition-all font-medium ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input
                type="file"
                accept=".gltf,.glb"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Load & Upload 3D Model'
              )}
            </label>
            {modelName && (
              <div className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium border border-green-500/30">
                {uploadSuccess ? '✓ Uploaded: ' : 'Loaded: '}{modelName}
              </div>
            )}
            {error && (
              <div className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm font-medium border border-red-500/30">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          {!modelUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-white text-xl font-semibold mb-2">No 3D Model Loaded</p>
                <p className="text-gray-300">Click "Load 3D Model" to upload a .gltf or .glb file</p>
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
                  <Model url={modelUrl} />
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

