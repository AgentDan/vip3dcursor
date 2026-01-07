import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import uploadService from '../../services/upload.service';

/**
 * Компонент панели редактирования env-параметров
 * Оптимизирован для работы с большим количеством параметров
 */
export function EnvEditorPanel({ envParams, onUpdate, onClose, isCollapsed: externalIsCollapsed, onCollapseChange }) {
  const [localParams, setLocalParams] = useState(envParams);
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(true);
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  const setIsCollapsed = onCollapseChange || setInternalIsCollapsed;
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);

  // Ref для предотвращения бесконечных циклов
  const prevEnvParamsRef = useRef(envParams);
  
  // Синхронизируем локальное состояние с пропсами
  useEffect(() => {
    // Проверяем, действительно ли параметры изменились
    const prevParams = prevEnvParamsRef.current;
    if (JSON.stringify(prevParams) === JSON.stringify(envParams)) {
      return; // Параметры не изменились, не обновляем
    }
    
    prevEnvParamsRef.current = envParams;
    
    if (envParams && Array.isArray(envParams) && envParams.length > 0) {
      setLocalParams(envParams);
    } else {
      setLocalParams([]);
    }
  }, [envParams]);

  // Ref для предотвращения повторных вызовов onUpdate
  const isUpdatingRef = useRef(false);

  // Мемоизируем обработчик для избежания лишних рендеров
  const handleChange = useCallback((index, key, value) => {
    setLocalParams(prev => {
      const updated = [...prev];
      if (updated[index]) {
        // Проверяем, действительно ли значение изменилось
        const currentValue = updated[index][key];
        // Для чисел с плавающей точкой используем приблизительное сравнение
        if (typeof currentValue === 'number' && typeof value === 'number') {
          if (Math.abs(currentValue - value) < 0.0001) {
            return prev; // Значение не изменилось, не обновляем
          }
        } else if (currentValue === value) {
          return prev; // Значение не изменилось, не обновляем
        }
        
        updated[index] = { ...updated[index], [key]: value };
        
        // Немедленно уведомляем родителя для применения к сцене
        // Используем setTimeout для гарантии, что состояние обновлено
        setTimeout(() => {
          onUpdate?.(updated);
        }, 0);
      }
      
      return updated;
    });
  }, [onUpdate]);

  // Функция для дублирования элемента
  const handleDuplicate = useCallback((originalIndex) => {
    setLocalParams(prev => {
      const updated = [...prev];
      // Находим элемент по оригинальному индексу
      const elementToDuplicate = updated.find((p, i) => i === originalIndex);
      if (elementToDuplicate) {
        // Создаем копию элемента без служебных полей
        const { _index, ...paramToDuplicate } = elementToDuplicate;
        const duplicated = { ...paramToDuplicate };
        // Вставляем дубликат после текущего элемента
        updated.splice(originalIndex + 1, 0, duplicated);
        // Обновляем индексы для всех элементов
        const newParams = updated.map((p, i) => ({ ...p }));
        setTimeout(() => {
          onUpdate?.(newParams);
        }, 0);
        return newParams;
      }
      return prev;
    });
  }, [onUpdate]);

  // Функция для удаления элемента
  const handleDelete = useCallback((originalIndex) => {
    setLocalParams(prev => {
      const updated = [...prev];
      if (updated[originalIndex]) {
        // Удаляем элемент
        updated.splice(originalIndex, 1);
        // Обновляем индексы для всех элементов
        const newParams = updated.map((p, i) => ({ ...p }));
        setTimeout(() => {
          onUpdate?.(newParams);
        }, 0);
        return newParams;
      }
      return prev;
    });
  }, [onUpdate]);

  // Группируем параметры по типу для лучшего UX
  const groupedParams = useMemo(() => {
    const groups = {};
    if (!localParams || !Array.isArray(localParams)) return groups;
    
    localParams.forEach((param, idx) => {
      if (!param || !param.type) return;
      
      if (!groups[param.type]) {
        groups[param.type] = [];
      }
      groups[param.type].push({ ...param, _index: idx });
    });
    return groups;
  }, [localParams]);

  const hasEnvParams = envParams && Array.isArray(envParams) && envParams.length > 0;

  // Функция для загрузки и применения дефолтных значений
  const handleLoadDefaults = useCallback(async () => {
    // Запрашиваем подтверждение
    const confirmed = window.confirm('Вы уверены, что хотите установить дефолтные значения? Текущие параметры будут заменены.');
    if (!confirmed) {
      return;
    }

    setIsLoadingDefaults(true);
    try {
      const defaultParams = await uploadService.getDefaultEnvParams();
      if (defaultParams && Array.isArray(defaultParams) && defaultParams.length > 0) {
        setLocalParams(defaultParams);
        onUpdate?.(defaultParams);
      }
    } catch (error) {
      console.error('Error loading default env params:', error);
    } finally {
      setIsLoadingDefaults(false);
    }
  }, [onUpdate]);


  return (
    <div className="fixed top-4 left-4 w-80 max-h-[85vh] overflow-hidden bg-white/20 backdrop-blur-[20px] rounded-lg shadow-2xl border border-gray-200/20 z-50 flex flex-col">
      {/* Заголовок */}
      <button
        onClick={() => setIsCollapsed(true)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/20 transition-colors border-b border-gray-200/20 bg-white/10 cursor-pointer"
        title="Collapse"
      >
        <h3 className="text-base font-light text-gray-900 uppercase tracking-wider">
          Env Parameters
        </h3>
        <svg
          className="w-4 h-4 text-gray-600 transition-transform duration-200 flex-shrink-0 rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Кнопка для загрузки дефолтных значений - всегда видна */}
          <button
            onClick={handleLoadDefaults}
            disabled={isLoadingDefaults}
            className="w-full px-2 py-1.5 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-gray-700 rounded transition-colors text-xs font-light flex items-center justify-center gap-1.5 border border-gray-200/20 cursor-pointer disabled:cursor-not-allowed"
            title="Установить дефолтные значения"
          >
            {isLoadingDefaults ? (
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
            <span className="truncate">Defaults</span>
          </button>

          {!hasEnvParams ? (
            <div className="bg-yellow-50/20 backdrop-blur-sm rounded-lg p-4 border border-yellow-200/20">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">Env параметры отсутствуют</p>
                  <p className="text-xs text-yellow-700 font-light">
                    В данном GLTF файле не найдены env параметры в <code className="bg-yellow-100/50 px-1 rounded">scenes[0].extras.env</code>
                  </p>
                </div>
              </div>
            </div>
          ) : Object.keys(groupedParams).length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No parameters found</p>
          ) : (
            Object.entries(groupedParams).map(([type, params]) => (
              <ParamGroup
                key={type}
                type={type}
                params={params}
                onChange={handleChange}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
    </div>
  );
}

/**
 * Компонент группы параметров одного типа
 */
function ParamGroup({ type, params, onChange, onDuplicate, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/10 rounded-lg border border-gray-200/20 overflow-hidden">
      {/* Заголовок группы */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/20 transition-colors"
      >
        <span className="text-xs font-medium text-gray-900 uppercase tracking-wider">
          {type} ({params.length})
        </span>
        <svg
          className={`w-3 h-3 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Параметры группы */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {params.map((param, idx) => (
            <ParamEditor
              key={`${type}_${param._index}_${idx}`}
              param={param}
              index={param._index}
              onChange={onChange}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Компонент редактирования одного параметра
 */
function ParamEditor({ param, index, onChange, onDuplicate, onDelete }) {
  if (!param) return null;

  return (
    <div className="bg-white/10 rounded p-2 border border-gray-200/20">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] text-gray-500 font-light">#{index}</div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.(index);
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors cursor-pointer"
            title="Дублировать элемент"
          >
            <svg
              className="w-3 h-3 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(index);
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors cursor-pointer"
            title="Удалить элемент"
          >
            <svg
              className="w-3 h-3 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </div>
      </div>
      {Object.keys(param).map(key => {
        if (key === 'type' || key === '_index' || key === 'index') return null;
        
        const value = param[key];
        return (
          <ParamField
            key={key}
            label={key}
            value={value}
            onChange={(newValue) => onChange(index, key, newValue)}
          />
        );
      })}
    </div>
  );
}

/**
 * Компонент поля параметра с умным определением типа контрола
 */
function ParamField({ label, value, onChange }) {
  const displayLabel = label.charAt(0).toUpperCase() + label.slice(1).replace(/([A-Z])/g, ' $1');

  if (typeof value === 'number') {
    const config = getNumberConfig(label, value);
    return (
      <div className="mb-2 last:mb-0">
        <label className="text-[10px] text-gray-600 block mb-1 font-light">
          {displayLabel}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
          />
          <input
            type="number"
            min={config.min}
            max={config.max}
            step={config.step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-16 px-1.5 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />
        </div>
      </div>
    );
  } else if (typeof value === 'boolean') {
    return (
      <div className="mb-2 last:mb-0 flex items-center justify-between">
        <label className="text-[10px] text-gray-600 font-light">
          {displayLabel}
        </label>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
        />
      </div>
    );
  } else if (typeof value === 'string') {
    return (
      <div className="mb-2 last:mb-0">
        <label className="text-[10px] text-gray-600 block mb-1 font-light">
          {displayLabel}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-gray-500"
        />
      </div>
    );
  } else if (Array.isArray(value) && value.length === 3) {
    // RGB или XYZ вектор
    return (
      <div className="mb-2 last:mb-0">
        <label className="text-[10px] text-gray-600 block mb-1 font-light">
          {displayLabel}
        </label>
        <div className="flex gap-1">
          {['X', 'Y', 'Z'].map((axis, idx) => (
            <div key={axis} className="flex-1">
              <input
                type="number"
                value={value[idx]}
                onChange={(e) => {
                  const newValue = [...value];
                  newValue[idx] = parseFloat(e.target.value) || 0;
                  onChange(newValue);
                }}
                className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                placeholder={axis}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Определяет конфигурацию для числовых полей на основе имени параметра
 */
function getNumberConfig(key, currentValue) {
  const lowerKey = key.toLowerCase();
  
  if (lowerKey.match(/color|rgb|red|green|blue|alpha/i)) {
    return { min: 0, max: 255, step: 1 };
  } else if (lowerKey.match(/intensity|brightness|exposure/i)) {
    return { min: 0, max: 2, step: 0.1 };
  } else if (lowerKey.match(/scale|size|radius|distance/i)) {
    return { min: 0.1, max: 10, step: 0.1 };
  } else if (lowerKey.match(/rotation|angle|degrees/i)) {
    return { min: -360, max: 360, step: 1 };
  } else if (lowerKey.match(/opacity|alpha/i)) {
    return { min: 0, max: 1, step: 0.01 };
  } else {
    // Умное определение диапазона на основе текущего значения
    const absValue = Math.abs(currentValue);
    if (absValue < 1) {
      return { min: -10, max: 10, step: 0.01 };
    } else if (absValue < 100) {
      return { min: -100, max: 100, step: 0.1 };
    } else {
      return { min: -1000, max: 1000, step: 1 };
    }
  }
}

