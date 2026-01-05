import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsername, isAuthenticated, isAdmin } from '../../utils/jwt.utils';
import uploadService from '../../services/upload.service';
import constructorService from '../../services/constructor.service';
import { getFileUrl } from '../../utils/config';
import Controller from './Controller';
import { buildRuntime } from './buildRuntime';

const Constructor = () => {
  const navigate = useNavigate();
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
  const [meshGroups, setMeshGroups] = useState({ defaultMeshes: [], groups: {} });
  const [selectedMeshes, setSelectedMeshes] = useState({}); // { "1": "Mesh_1_1", "2": "Mesh_2_1" }
  const [isMenuOpen, setIsMenuOpen] = useState(true); // Состояние открыто/закрыто меню

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
      setMeshGroups({ defaultMeshes: [], groups: {} });
      setSelectedMeshes({});
    }
  }, [currentPath]);

  // Обработчик для получения информации о группах мешей
  const handleMeshesGrouped = useCallback(({ defaultMeshes, groups }) => {
    setMeshGroups({ defaultMeshes, groups });
    
    // Устанавливаем первый объект в каждой группе как выбранный по умолчанию
    const initialSelected = {};
    Object.keys(groups).forEach(groupNum => {
      if (groups[groupNum].length > 0) {
        // groups[groupNum] - это массив объектов, берем key первого объекта
        initialSelected[groupNum] = groups[groupNum][0].key;
      }
    });
    setSelectedMeshes(initialSelected);
  }, []);

  // Обработчик изменения выбранного меша в группе
  const handleMeshSelect = (groupNum, meshName) => {
    setSelectedMeshes(prev => ({
      ...prev,
      [groupNum]: meshName
    }));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Canvas с 3D моделью на заднем плане */}
      <Controller 
        gltf={gltf} 
        runtime={runtime} 
        currentPath={currentPath}
        onGltfLoad={handleGltfLoad}
        selectedMeshes={selectedMeshes}
        onMeshesGrouped={handleMeshesGrouped}
      />
      
      {/* Кнопки Home и Constructor - правый верхний угол */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 flex flex-col items-end gap-2">
        <button
          onClick={() => navigate('/home')}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md text-black rounded-lg hover:bg-white/20 transition-all font-light text-xs sm:text-sm uppercase tracking-wider border border-white/20 cursor-pointer flex-shrink-0 whitespace-nowrap shadow-lg"
          title="Go to home page"
        >
          Home
        </button>

        {/* Выпадающий список с кнопкой Constructor */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-lg overflow-hidden min-w-[200px] sm:min-w-[250px]">
          {/* Кнопка заголовка "Constructor" */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md text-black rounded-lg hover:bg-white/20 transition-all font-light text-xs sm:text-sm uppercase tracking-wider border border-white/20 cursor-pointer flex items-center justify-between"
          >
            <span>Constructor</span>
            <svg
              className={`w-4 h-4 text-black transition-transform duration-200 flex-shrink-0 ${isMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Содержимое меню (показывается/скрывается) */}
          {isMenuOpen && (
            <div className="px-3 sm:px-4 pt-3 pb-3 sm:pb-4 space-y-3">
              {loading && (
                <p className="text-xs sm:text-sm text-gray-700 font-light">Загрузка файлов...</p>
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
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md text-black rounded-lg border border-white/20 outline-none transition-all focus:border-white/40 focus:bg-white/20 hover:bg-white/15 font-light text-xs sm:text-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23000000%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpolyline points=%226 9 12 15 18 9%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1em] bg-[right_0.5rem_center] bg-no-repeat pr-8"
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
                <p className="text-xs sm:text-sm text-gray-700 font-light">Файлы не найдены</p>
              )}

              {/* Выпадающие списки для групп мешей */}
              {gltf && Object.keys(meshGroups.groups).length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <h2 className="text-xs sm:text-sm font-light text-black uppercase tracking-wider mb-2">Группы мешей</h2>
                  {Object.entries(meshGroups.groups)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b)) // Сортируем группы по номеру
                    .map(([groupNum, objects]) => (
                      <div key={groupNum} className="space-y-1">
                        <label className="block text-xs sm:text-sm font-light text-gray-700">
                          Группа {groupNum}
                        </label>
                        <select
                          value={selectedMeshes[groupNum] || ""}
                          onChange={(e) => handleMeshSelect(groupNum, e.target.value)}
                          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md text-black rounded-lg border border-white/20 outline-none transition-all focus:border-white/40 focus:bg-white/20 hover:bg-white/15 font-light text-xs sm:text-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23000000%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpolyline points=%226 9 12 15 18 9%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1em] bg-[right_0.5rem_center] bg-no-repeat pr-8"
                        >
                          {objects.map((obj) => (
                            <option key={obj.key} value={obj.key}>
                              {obj.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Constructor;
