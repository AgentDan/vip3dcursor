import { useEffect, useState, useRef, useCallback } from 'react';
import { collectMeshes, groupMeshes } from '../../utils/meshUtils';
import { Scene3D } from '../../components/Scene3D/Scene3D';

/**
 * Тонкий контроллер для управления 3D сценой
 * Оптимизирован для работы с большими сценами (500+ мешей):
 * - GLTF загружается один раз
 * - Меши собираются один раз
 * - Schema загружается один раз
 * - Видимость обновляется только при смене selectedMeshes
 */
const Controller = ({ gltf, gltfHelper, currentPath, onGltfLoad, selectedMeshes, onMeshesGrouped, envParams }) => {
  const [schema, setSchema] = useState(null);
  const [meshGroups, setMeshGroups] = useState({ defaultMeshes: [], groups: {} });

  // Кешируем ссылку на сцену для предотвращения повторной обработки
  const gltfSceneRef = useRef(null);
  // Кешируем загруженную schema
  const schemaRef = useRef(null);
  // Кешируем сгруппированные меши
  const meshGroupsRef = useRef({ defaultMeshes: [], groups: {} });

  // Мемоизируем callback для передачи групп мешей
  // Используем useRef для onMeshesGrouped, чтобы избежать лишних пересчетов
  const onMeshesGroupedRef = useRef(onMeshesGrouped);
  useEffect(() => {
    onMeshesGroupedRef.current = onMeshesGrouped;
  }, [onMeshesGrouped]);

  const handleMeshesGrouped = useCallback((defaultMeshes, groups) => {
    const groupsData = { defaultMeshes, groups };
    meshGroupsRef.current = groupsData;
    setMeshGroups(groupsData);
    
    if (onMeshesGroupedRef.current) {
      onMeshesGroupedRef.current(groupsData);
    }
  }, []); // Не зависит от onMeshesGrouped

  // Загружаем schema ОДИН раз при монтировании компонента
  useEffect(() => {
    if (schemaRef.current !== null) return; // Schema уже загружена
    
    fetch('/schema.json')
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return null;
      })
      .then(data => {
        schemaRef.current = data;
        setSchema(data);
      })
      .catch(error => {
        // Schema не найдена или ошибка - это нормально
        schemaRef.current = null;
      });
  }, []); // Загружаем только один раз

  // Собираем и группируем меши ОДИН раз при загрузке новой модели
  useEffect(() => {
    // Проверяем, изменилась ли сцена (сравниваем по ссылке)
    if (gltf && gltf.scene && gltfSceneRef.current !== gltf.scene) {
      gltfSceneRef.current = gltf.scene;

      // Собираем и группируем меши ОДИН РАЗ
      const allMeshes = collectMeshes(gltf.scene);
      const meshNames = allMeshes.map(m => m.name);
      const { defaultMeshes, groups } = groupMeshes(meshNames);

      // Сохраняем группы
      handleMeshesGrouped(defaultMeshes, groups);
    } else if (!gltf || !gltf.scene) {
      // Очищаем при размонтировании
      gltfSceneRef.current = null;
      const emptyGroups = { defaultMeshes: [], groups: {} };
      meshGroupsRef.current = emptyGroups;
      setMeshGroups(emptyGroups);
    }
  }, [gltf, handleMeshesGrouped]); // Зависит только от gltf

  return (
    <Scene3D
      currentPath={currentPath}
      gltf={gltf}
      gltfHelper={gltfHelper}
      selectedMeshes={selectedMeshes}
      meshGroups={meshGroups}
      schema={schema}
      onGltfLoad={onGltfLoad}
      envParams={envParams}
    />
  );
};

export default Controller;
