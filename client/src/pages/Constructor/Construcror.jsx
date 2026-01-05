import { useEffect, useState } from 'react';
import { getUsername, isAuthenticated, isAdmin } from '../../utils/jwt.utils';
import uploadService from '../../services/upload.service';
import constructorService from '../../services/constructor.service';

const Constructor = () => {
  const authenticated = isAuthenticated();
  const [userModelsNames, setUserModelsNames] = useState([]);
  const [userFiles, setUserFiles] = useState([]); // Сохраняем оригинальные файлы
  const [username, setUsername] = useState(null);
  const [admin, setAdmin] = useState();
  const [loading, setLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

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
    if (!projectName || !username) {
      setCurrentProject(null);
      return;
    }

    setCurrentProject(projectName);
    
    console.log("=== Выбранный проект ===");
    console.log("Название проекта:", projectName);
    
    // Находим оригинальный файл по названию проекта
    const selectedFile = userFiles.find(file => {
      const fileLatinName = file.filename.replace(/[^a-zA-Z]/g, '');
      return fileLatinName === projectName;
    });

    if (!selectedFile) {
      console.error('Файл не найден для проекта:', projectName);
      return;
    }

    // Проверяем, что это GLTF файл
    if (!selectedFile.filename.endsWith('.gltf') && !selectedFile.filename.endsWith('.glb')) {
      console.error('Выбранный файл не является GLTF:', selectedFile.filename);
      return;
    }

    try {
      console.log('=== Получение GLTF файла ===');
      console.log('Файл:', selectedFile.filename);
      console.log('Username:', username);
      
      // Получаем информацию о GLTF файле
      const gltfInfo = await uploadService.getGltfInfo(selectedFile.filename, username);
      
      console.log('=== GLTF Info ===');
      console.log('Gltf Info:', gltfInfo);
      console.log('Extras:', gltfInfo.extras);
      console.log('Env:', gltfInfo.env);
      
    } catch (error) {
      console.error('Ошибка при получении GLTF файла:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-light mb-4">Конструктор</h1>

      {loading && (
        <p className="text-gray-600">Загрузка файлов...</p>
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
            }
          }}
          className="w-full max-w-md px-4 py-2.5 bg-white/10 backdrop-blur-[5px] text-gray-900 rounded-lg border border-white/20 outline-none transition-all focus:border-white/40 focus:bg-white/20 hover:bg-white/15 font-light text-sm cursor-pointer shadow-lg hover:shadow-xl appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23334155%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpolyline points=%226 9 12 15 18 9%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1.2em] bg-[right_0.75rem_center] bg-no-repeat pr-10"
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
        <p className="text-gray-600">Файлы не найдены</p>
      )}
    </div>
  );
};

export default Constructor;
