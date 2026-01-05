import { useEffect, useState, useCallback, useRef } from 'react';
import { getUsername, isAuthenticated, isAdmin } from '../../utils/jwt.utils';
import uploadService from '../../services/upload.service';
import constructorService from '../../services/constructor.service';
import { getFileUrl } from '../../utils/config';
import Controller from './Controller';
import { buildRuntime } from './buildRuntime';

const Constructor = () => {
  const authenticated = isAuthenticated();
  const [userModelsNames, setUserModelsNames] = useState([]);
  const [userFiles, setUserFiles] = useState([]); // Сохраняем оригинальные файлы
  const [username, setUsername] = useState(null);
  const [admin, setAdmin] = useState();
  const [loading, setLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [gltfInfo, setGltfInfo] = useState(null);
  const [currentPath, setCurrentPath] = useState(null);
  const [gltf, setGltf] = useState(null);
  const [runtime, setRuntime] = useState(null);

  const gltfRef = useRef(null);
  
  const handleGltfLoad = useCallback((gltfData) => {
    if (!gltfData) return;
    
    // Проверяем, изменился ли gltf (сравниваем по ссылке scene)
    if (gltfRef.current === gltfData.scene) {
      return; // Не обновляем, если это та же модель
    }
    
    gltfRef.current = gltfData.scene;
    setGltf(gltfData);
    // Строим runtime из gltf
    const runtimeData = buildRuntime(gltfData);
    setRuntime(runtimeData);
  }, []);

  useEffect(() => {
    setUsername(getUsername());
    setAdmin(isAdmin());
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const fetchModels = async () => {
      try {
        const files = await uploadService.getFilesForConstructor();
        setUserFiles(files); // Сохраняем оригинальные файлы
        const models = await constructorService.userModelsNames(files);
        setUserModelsNames(models);
      } catch (e) {
        console.error('Ошибка при получении моделей:', e);
      }
    }
    fetchModels();
  }, [authenticated]);

  const handleProjectSelect = async (projectName) => {
    setCurrentProject(projectName);

    const selectedFile = userFiles.find(file => {
      const fileLatinName = file.filename.replace(/[^a-zA-Z]/g, '');
      return fileLatinName === projectName;
    });

    if (!selectedFile) {
      setCurrentPath(null);
      // Очищаем gltf и runtime при отсутствии файла
      setGltf(null);
      setRuntime(null);
      return;
    }

    // Устанавливаем путь к выбранному GLTF файлу
    const filePath = getFileUrl(selectedFile.url);
    setCurrentPath(filePath);

    try {
      const gltfInfo = await uploadService.getGltfInfo(selectedFile.filename, username);
      setGltfInfo(gltfInfo);
    } catch (error) {
      console.error('Ошибка при получении GLTF файла:', error);
    }
  };

  useEffect(() => {
    // Очищаем gltf и runtime при сбросе currentPath
    if (!currentPath) {
      gltfRef.current = null;
      setGltf(null);
      setRuntime(null);
    }
  }, [currentPath]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Canvas с 3D моделью на заднем плане */}
      <Controller 
        gltf={gltf} 
        runtime={runtime} 
        currentPath={currentPath}
        onGltfLoad={handleGltfLoad}
      />
      
      {/* Выпадающий список поверх Canvas */}
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-white/20 backdrop-blur-[10px] rounded-lg border border-white/30 p-4 shadow-xl">
          <h1 className="text-2xl font-light mb-4 text-gray-900">Конструктор</h1>

          {loading && (
            <p className="text-gray-700">Загрузка файлов...</p>
          )}

          {!loading && userModelsNames.length > 0 && (
            <select
              value={currentProject || ""}
              onChange={(e) => {
                const selectedProject = e.target.value;
                if (selectedProject) {
                  handleProjectSelect(selectedProject);
                } else {
                  setCurrentProject(null);
                  setCurrentPath(null);
                  // Очищаем gltf и runtime при сбросе выбора
                  setGltf(null);
                  setRuntime(null);
                }
              }}
              className="w-full max-w-md px-4 py-2.5 bg-white/30 backdrop-blur-[5px] text-gray-900 rounded-lg border border-white/40 outline-none transition-all focus:border-white/60 focus:bg-white/40 hover:bg-white/35 font-light text-sm cursor-pointer shadow-lg hover:shadow-xl appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23334155%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpolyline points=%226 9 12 15 18 9%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1.2em] bg-[right_0.75rem_center] bg-no-repeat pr-10"
            >
              <option value="">Выбери модель ...</option>
              {userModelsNames.map((i, index) => {
                return (
                  <option key={index} value={i}>
                    {i}
                  </option>
                );
              })}
            </select>
          )}

          {!loading && userModelsNames.length === 0 && (
            <p className="text-gray-700">Файлы не найдены</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Constructor;
