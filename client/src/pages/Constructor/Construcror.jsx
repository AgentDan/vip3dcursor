import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsername, isAuthenticated, isAdmin } from '../../utils/jwt.utils';
import uploadService from '../../services/upload.service';
import constructorService from '../../services/constructor.service';
import { getFileUrl } from '../../utils/config';
import Controller from './Controller';
import { buildGltfHelper } from '../../utils/gltfHelper';
import { EnvEditorPanel } from '../../components/EnvEditor/EnvEditorPanel';

const Constructor = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const userIsAdmin = isAdmin();
  const [userModelsNames, setUserModelsNames] = useState([]);
  const [userFiles, setUserFiles] = useState([]); // Сохраняем оригинальные файлы
  const [username, setUsername] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentPath, setCurrentPath] = useState(null);
  const [gltf, setGltf] = useState(null);
  const [gltfHelper, setGltfHelper] = useState(null);
  const [meshGroups, setMeshGroups] = useState({ defaultMeshes: [], groups: {} });
  const [selectedMeshes, setSelectedMeshes] = useState({}); // { "1": "Mesh_1_1", "2": "Mesh_2_1" }
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Состояние открыто/закрыто меню
  const [envParams, setEnvParams] = useState([]); // Env параметры из GLTF
  const [isEnvPanelCollapsed, setIsEnvPanelCollapsed] = useState(true); // Состояние свернута/развернута панель Env Parameters

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
      currentPathRef.current = null;
      // Очищаем gltf и gltfHelper при отсутствии файла
      setGltf(null);
      setGltfHelper(null);
      setEnvParams([]);
      return;
    }

    // Устанавливаем путь к выбранному GLTF файлу
    const filePath = getFileUrl(selectedFile.url);
    setCurrentPath(filePath);
    currentPathRef.current = filePath; // Сохраняем в ref для доступа в handleGltfLoad
  }, [userFiles]);

  useEffect(() => {
    // Очищаем gltf и gltfHelper при сбросе currentPath
    if (!currentPath) {
      gltfRef.current = null;
      currentPathRef.current = null;
      setGltf(null);
      setGltfHelper(null);
      setMeshGroups({ defaultMeshes: [], groups: {} });
      setSelectedMeshes({});
      setEnvParams([]);
    }
  }, [currentPath]);
  
  // Автоматически выбираем первую модель при загрузке файлов
  useEffect(() => {
    if (userModelsNames.length > 0 && !currentProject && userFiles.length > 0) {
      const firstModel = userModelsNames[0];
      if (firstModel) {
        // Находим файл для первой модели
        const selectedFile = userFiles.find(file => {
          const fileLatinName = file.filename.replace(/[^a-zA-Z]/g, '');
          return fileLatinName === firstModel;
        });

        if (selectedFile) {
          // Устанавливаем проект и путь напрямую, без использования handleProjectSelect
          setCurrentProject(firstModel);
          const filePath = getFileUrl(selectedFile.url);
          setCurrentPath(filePath);
          currentPathRef.current = filePath;
        }
      }
    }
  }, [userModelsNames, userFiles, currentProject]);

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
    // Всегда обновляем состояние для визуального отображения
    envParamsRef.current = updatedParams;
    setEnvParams(updatedParams);
    
    // Сохраняем на сервер только если пользователь - администратор и файл - GLTF
    const shouldSave = userIsAdmin && currentPath && currentPath.endsWith('.gltf');
    
    // Показываем индикатор сохранения, если пользователь - администратор
    if (userIsAdmin && currentPath && currentPath.endsWith('.gltf')) {
      // Очищаем предыдущий timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Показываем индикатор сохранения сразу
      setIsSaving(true);
    }
    
    if (!shouldSave) {
      return; // Не сохраняем, если пользователь не администратор или файл не GLTF
    }
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Убеждаемся, что передаем полный массив параметров
        // Используем актуальные параметры из ref на момент сохранения
        const paramsToSave = envParamsRef.current || updatedParams;
        
        // Убеждаемся, что это массив
        if (!Array.isArray(paramsToSave) || paramsToSave.length === 0) {
          setIsSaving(false);
          return;
        }
        
        // Копируем параметры, чтобы убедиться, что все значения правильно сериализуются
        const sanitizedParams = paramsToSave.map(param => {
          if (!param || typeof param !== 'object') {
            return param;
          }
          
          const sanitized = { ...param };
          
          // Убеждаемся, что все числовые значения правильно преобразованы
          if (sanitized.intensity !== undefined && sanitized.intensity !== null) {
            sanitized.intensity = Number(sanitized.intensity);
          }
          if (sanitized.red !== undefined && sanitized.red !== null) {
            sanitized.red = Number(sanitized.red);
          }
          if (sanitized.green !== undefined && sanitized.green !== null) {
            sanitized.green = Number(sanitized.green);
          }
          if (sanitized.blue !== undefined && sanitized.blue !== null) {
            sanitized.blue = Number(sanitized.blue);
          }
          
          // Для environment параметров сохраняем все свойства
          if (sanitized.type === 'environment') {
            // Сохраняем file как есть (строка)
            if (sanitized.file !== undefined && sanitized.file !== null) {
              sanitized.file = String(sanitized.file);
            }
            // Сохраняем background как boolean
            if (sanitized.background !== undefined && sanitized.background !== null) {
              sanitized.background = Boolean(sanitized.background);
            }
          }
          
          return sanitized;
        });
        
        // Сохраняем env параметры в текущий открытый файл
        const result = await uploadService.updateGltfEnv(currentPath, sanitizedParams);
        setIsSaving(false);
        
        // После успешного сохранения обновляем envParams из сохраненного файла
        // Это гарантирует, что HDRI применится с правильными параметрами
        if (currentPath && currentPath.endsWith('.gltf')) {
          try {
            // Добавляем timestamp к URL для обхода кеша
            const cacheBuster = `?t=${Date.now()}`;
            const response = await fetch(currentPath + cacheBuster);
            if (response.ok) {
              const gltfJson = await response.json();
              const env = gltfJson.scenes?.[0]?.extras?.env;
              if (env && Array.isArray(env) && env.length > 0) {
                setEnvParams(env);
                envParamsRef.current = env;
              }
            }
          } catch (error) {
            // Игнорируем ошибку загрузки, используем уже сохраненные параметры
          }
        }
      } catch (error) {
        setIsSaving(false);
      }
    }, 500);
  }, [currentPath, userIsAdmin]);


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

      {/* Иконка Env Parameters - левая сторона */}
      {gltf && userIsAdmin && isEnvPanelCollapsed && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-50">
          <button
            onClick={() => setIsEnvPanelCollapsed(false)}
            className="p-2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-lg border border-white/20 cursor-pointer shadow-lg transition-all"
            title="Env Parameters"
          >
            <svg
              className="w-5 h-5 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      )}

      {/* Панель Constructor - абсолютно позиционирована */}
      {isMenuOpen && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-lg overflow-hidden min-w-[200px] sm:min-w-[250px]">
            {/* Кнопка заголовка "Constructor" */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md text-black rounded-lg hover:bg-white/20 transition-all font-light text-xs sm:text-sm uppercase tracking-wider border border-white/20 cursor-pointer flex items-center justify-between"
            >
              <span>Constructor</span>
              <svg
                className="w-4 h-4 text-black transition-transform duration-200 flex-shrink-0 rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Содержимое меню */}
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
          </div>
      )}

      {/* Иконки Constructor и Home - правый верхний угол, всегда на месте */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 flex flex-row items-center gap-2">
        {/* Иконка Constructor */}
        {!isMenuOpen && (
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-lg border border-white/20 cursor-pointer shadow-lg transition-all"
            title="Constructor"
          >
            <svg
              className="w-5 h-5 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
        )}

        {/* Кнопка Home - крайняя справа, всегда на месте */}
        <button
          onClick={() => navigate('/home')}
          className="p-2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-lg border border-white/20 cursor-pointer shadow-lg transition-all flex-shrink-0"
          title="Go to home page"
        >
          <svg
            className="w-5 h-5 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>

      {/* Кнопка для открытия редактора env параметров - всегда для администраторов */}
      {gltf && userIsAdmin && (
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 z-40">
          {isSaving && (
            <div className="px-3 py-1 bg-white/80 backdrop-blur-md text-black rounded text-xs font-light">
              Saving...
            </div>
          )}
        </div>
      )}

      {/* Панель редактора env параметров - автоматически показывается для администраторов */}
      {gltf && userIsAdmin && !isEnvPanelCollapsed && (
        <EnvEditorPanel
          envParams={envParams || []}
          onUpdate={handleEnvParamsUpdate}
          onClose={() => setIsEnvPanelCollapsed(true)}
          isCollapsed={isEnvPanelCollapsed}
          onCollapseChange={setIsEnvPanelCollapsed}
        />
      )}
    </div>
  );
};

export default Constructor;
