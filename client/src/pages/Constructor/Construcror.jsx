import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsername, isAuthenticated, isAdmin } from '../../utils/jwt.utils';
import uploadService from '../../services/upload.service';
import constructorService from '../../services/constructor.service';
import { getFileUrl } from '../../utils/config';
import Controller from './Controller';
import { buildGltfHelper } from '../../utils/gltfHelper';
import { EnvEditorPanel } from '../../components/EnvEditor/EnvEditorPanel';

// Проверка, является ли файл файлом из uploadlab
// Определяем вне компонента, чтобы избежать проблем с инициализацией
const isUploadLabFile = (filePath) => {
  if (!filePath) {
    return false;
  }
  // Проверяем различные варианты URL для файлов из uploadlab
  // Может быть: /uploads/uploadlab/, /uploadlab/, или просто uploadlab в пути
  const isLab = filePath.includes('/uploads/uploadlab/') || 
                filePath.includes('/uploadlab/') ||
                (filePath.includes('uploadlab') && !filePath.includes('/uploads/'));
  
  return isLab;
};

const Constructor = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const userIsAdmin = isAdmin();
  const [userModelsNames, setUserModelsNames] = useState([]);
  const [userFiles, setUserFiles] = useState([]); // Сохраняем оригинальные файлы
  const [username, setUsername] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentPath, setCurrentPath] = useState(null);
  const [currentFileIsUploadLab, setCurrentFileIsUploadLab] = useState(false);
  const [gltf, setGltf] = useState(null);
  const [gltfHelper, setGltfHelper] = useState(null);
  const [meshGroups, setMeshGroups] = useState({ defaultMeshes: [], groups: {} });
  const [selectedMeshes, setSelectedMeshes] = useState({}); // { "1": "Mesh_1_1", "2": "Mesh_2_1" }
  const [isMenuOpen, setIsMenuOpen] = useState(true); // Состояние открыто/закрыто меню
  const [envParams, setEnvParams] = useState([]); // Env параметры из GLTF
  const [showEnvEditor, setShowEnvEditor] = useState(false); // Показать/скрыть редактор env

  const gltfRef = useRef(null);
  const currentPathRef = useRef(null);

  const handleGltfLoad = useCallback(async (gltfData) => {
    if (!gltfData) {
      return;
    }

    // Проверяем, изменился ли gltf (сравниваем по ссылке scene)
    if (gltfRef.current === gltfData.scene) {
      return; // Не обновляем, если это та же модель
    }

    gltfRef.current = gltfData.scene;
    setGltf(gltfData);
    // Строим helper из gltf
    const helperData = buildGltfHelper(gltfData);
    setGltfHelper(helperData);

    // Извлекаем env параметры из GLTF
    // useGLTF может не включать полный JSON, поэтому загружаем GLTF файл напрямую
    const pathToLoad = currentPathRef.current || currentPath;
    
    if (pathToLoad && pathToLoad.endsWith('.gltf')) {
      try {
        const response = await fetch(pathToLoad);
        if (!response.ok) {
          setEnvParams([]);
          return;
        }
        const gltfJson = await response.json();
        const env = gltfJson.scenes?.[0]?.extras?.env;
        
        if (env && Array.isArray(env) && env.length > 0) {
          // Логируем background данные из GLTF
          // Background data extracted from GLTF
          setEnvParams(env);
        } else {
          setEnvParams([]);
        }
      } catch (error) {
        setEnvParams([]);
      }
    } else {
      // Пробуем из gltfData напрямую (на случай если useGLTF сохранил extras)
      const env = gltfData.scenes?.[0]?.extras?.env;
      if (env && Array.isArray(env) && env.length > 0) {
        // Background data extracted from gltfData
        setEnvParams(env);
      } else {
        setEnvParams([]);
      }
    }
  }, [currentPath]);

  useEffect(() => {
    setUsername(getUsername());
  }, []);


  useEffect(() => {
    if (!authenticated) return;
    const fetchModels = async () => {
      try {
        const files = await uploadService.getFilesForConstructor();
        const models = await constructorService.userModelsNames(files);
        
        // Если пользователь - администратор, загружаем файл из uploadlab
        if (userIsAdmin) {
          try {
            const labFile = await uploadService.getUploadLabFile();
            if (labFile && labFile.file) {
              const labFileUrl = labFile.file.url || `/uploads/uploadlab/${labFile.file.filename}`;
              
              // Проверяем, нет ли уже такого файла в списке (по URL или filename)
              const fileExists = files.some(f => 
                f.url === labFileUrl || 
                f.filename === labFile.file.filename ||
                (f.url && f.url.includes('/uploadlab/') && labFileUrl.includes('/uploadlab/'))
              );
              
              if (!fileExists) {
                // Добавляем файл из uploadlab в список
                const labFileWithUrl = {
                  ...labFile.file,
                  url: labFileUrl,
                  isUploadLab: true // Добавляем флаг для идентификации
                };
                files.push(labFileWithUrl);
                
                const labModelName = labFile.file.filename.replace(/[^a-zA-Z]/g, '');
                if (labModelName && !models.includes(labModelName)) {
                  models.push(labModelName);
                }
              }
            }
          } catch (e) {
            // Игнорируем ошибку, если файла нет в uploadlab
          }
        }
        
        // Устанавливаем финальные списки
        setUserFiles(files);
        setUserModelsNames(models);
      } catch (e) {
        // Ошибка при получении моделей
      }
    }
    fetchModels();
  }, [authenticated, userIsAdmin]);

  const handleProjectSelect = useCallback((projectName) => {
    setCurrentProject(projectName);

    const selectedFile = userFiles.find(file => {
      const fileLatinName = file.filename.replace(/[^a-zA-Z]/g, '');
      return fileLatinName === projectName;
    });

    if (!selectedFile) {
      setCurrentPath(null);
      setCurrentFileIsUploadLab(false);
      currentPathRef.current = null;
      // Очищаем gltf и gltfHelper при отсутствии файла
      setGltf(null);
      setGltfHelper(null);
      setEnvParams([]);
      return;
    }

    // Устанавливаем путь к выбранному GLTF файлу
    const filePath = getFileUrl(selectedFile.url);
    const isLab = selectedFile.isUploadLab || isUploadLabFile(filePath);
    setCurrentPath(filePath);
    setCurrentFileIsUploadLab(isLab);
    currentPathRef.current = filePath; // Сохраняем в ref для доступа в handleGltfLoad
  }, [userFiles]);

  useEffect(() => {
    // Очищаем gltf и gltfHelper при сбросе currentPath
    if (!currentPath) {
      gltfRef.current = null;
      currentPathRef.current = null;
      setCurrentFileIsUploadLab(false);
      setGltf(null);
      setGltfHelper(null);
      setMeshGroups({ defaultMeshes: [], groups: {} });
      setSelectedMeshes({});
      setEnvParams([]);
    }
  }, [currentPath]);

  // Cleanup для timeout при размонтировании
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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
  const handleMeshSelect = useCallback((groupNum, meshName) => {
    setSelectedMeshes(prev => ({
      ...prev,
      [groupNum]: meshName
    }));
  }, []);

  // Ref для debounce сохранения
  const saveTimeoutRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  // Ref для предотвращения бесконечных циклов
  const envParamsRef = useRef(envParams);
  
  useEffect(() => {
    envParamsRef.current = envParams;
  }, [envParams]);

  // Обработчик обновления env параметров
  const handleEnvParamsUpdate = useCallback((updatedParams) => {
    // Проверяем, действительно ли параметры изменились
    const currentParams = envParamsRef.current;
    try {
      if (JSON.stringify(currentParams) === JSON.stringify(updatedParams)) {
        return; // Параметры не изменились, не обновляем
      }
    } catch (e) {
      // Если JSON.stringify не работает, обновляем в любом случае
    }
    
    envParamsRef.current = updatedParams;
    setEnvParams(updatedParams);
    
    // Сохраняем на сервер только если файл из uploadlab и пользователь - администратор
    if (!currentFileIsUploadLab && !isUploadLabFile(currentPath)) {
      return; // Не сохраняем, если файл не из uploadlab
    }
    
    if (!userIsAdmin) {
      return; // Не сохраняем, если пользователь не администратор
    }
    
    // Очищаем предыдущий timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Сохраняем с задержкой 500ms
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await uploadService.updateUploadLabGltfEnv(updatedParams);
        setIsSaving(false);
      } catch (error) {
        setIsSaving(false);
      }
    }, 500);
  }, [currentFileIsUploadLab, currentPath, userIsAdmin]);


  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Canvas с 3D моделью на заднем плане */}
      <Controller
        gltf={gltf}
        gltfHelper={gltfHelper}
        currentPath={currentPath}
        onGltfLoad={handleGltfLoad}
        selectedMeshes={selectedMeshes}
        onMeshesGrouped={handleMeshesGrouped}
        envParams={envParams}
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
              {userModelsNames.length > 0 && (
                <select
                  value={currentProject || ""}
                  onChange={(e) => {
                    const selectedProject = e.target.value;
                    if (selectedProject) {
                      handleProjectSelect(selectedProject);
                    } else {
                      setCurrentProject(null);
                      setCurrentPath(null);
                      // Очищаем gltf и gltfHelper при сбросе выбора
                      setGltf(null);
                      setGltfHelper(null);
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

              {userModelsNames.length === 0 && (
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

      {/* Кнопка для открытия редактора env параметров - всегда для администраторов */}
      {gltf && userIsAdmin && (
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 z-40">
          {isSaving && (
            <div className="px-3 py-1 bg-white/80 backdrop-blur-md text-black rounded text-xs font-light">
              Saving...
            </div>
          )}
          <button
            onClick={() => setShowEnvEditor(!showEnvEditor)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md text-black rounded-lg hover:bg-white/20 transition-all font-light text-xs sm:text-sm uppercase tracking-wider border border-white/20 cursor-pointer flex-shrink-0 whitespace-nowrap shadow-lg"
            title="Toggle Env Parameters Editor"
          >
            Env Editor {envParams && envParams.length > 0 ? `(${envParams.length})` : ''}
          </button>
        </div>
      )}

      {/* Панель редактора env параметров */}
      {showEnvEditor && (
        <EnvEditorPanel
          envParams={envParams || []}
          onUpdate={handleEnvParamsUpdate}
          onClose={() => setShowEnvEditor(false)}
        />
      )}
    </div>
  );
};

export default Constructor;
