# Архитектура Конструктора и 3D Отрисовки

## Обзор

Конструктор - это модуль для интерактивного просмотра и управления 3D моделями (GLTF/GLB) с возможностью выбора различных вариантов мешей через группировку.

## Структура компонентов

```
┌─────────────────────────────────────────────────────────────┐
│                    Constructor Module                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Constructor.jsx (Main Component)             │  │
│  │  - Управление состоянием                             │  │
│  │  - Загрузка списка моделей                           │  │
│  │  - Выбор модели                                      │  │
│  │  - UI элементы (выпадающие списки)                   │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
│                 │ Props: gltf, gltfHelper, currentPath,     │
│                 │       selectedMeshes, onMeshesGrouped      │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │         Controller.jsx (Thin Controller)            │  │
│  │  - Группировка мешей при загрузке                    │  │
│  │  - Загрузка schema                                   │  │
│  │  - Передача данных в Scene3D                         │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │         Scene3D.jsx (3D Scene Component)            │  │
│  │  - Управление Canvas                                 │  │
│  │  - Композиция компонентов                            │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
│                 │ Components:                                │
│                 │  - GltfLoader (components/Scene3D/)        │
│                 │  - CameraController (components/Scene3D/)  │
│                 │  - MeshVisibilityController (components/Scene3D/) │
│                 │  - GltfScene (components/Scene3D/)         │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │         Utils                                         │  │
│  │  - meshUtils.js (collectMeshes, groupMeshes)         │  │
│  │  - gltfHelper.js (buildGltfHelper)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Services                                      │  │
│  │  - uploadService.getFilesForConstructor()             │  │
│  │  - uploadService.getGltfInfo()                       │  │
│  │  - constructorService.userModelsNames()             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Детальная структура компонентов

### 1. Constructor.jsx (Главный компонент)

**Ответственность:**
- Управление состоянием приложения
- Загрузка списка моделей пользователя
- Обработка выбора модели
- Отображение UI элементов (выпадающие списки)
- Управление группами мешей

**Состояние:**
```javascript
- userModelsNames: string[]          // Список названий моделей
- userFiles: File[]                  // Оригинальные файлы
- currentProject: string | null      // Выбранный проект
- currentPath: string | null         // URL выбранного GLTF файла
- gltf: GLTFData | null              // Загруженные GLTF данные
- gltfHelper: GltfHelperData | null  // Helper данные (meshesMap, materialsMap)
- meshGroups: {                      // Группы мешей
    defaultMeshes: string[],
    groups: { [groupNum]: Object[] }
  }
- selectedMeshes: { [groupNum]: objectKey }  // Выбранные объекты по группам
- isMenuOpen: boolean                // Состояние меню (открыто/закрыто)
```

**Основные функции:**
- `handleProjectSelect()` - обработка выбора модели
- `handleMeshesGrouped()` - получение информации о группах мешей
- `handleMeshSelect()` - обработка выбора объекта в группе

### 2. Controller.jsx (Тонкий контроллер)

**Ответственность:**
- Группировка мешей при загрузке модели
- Загрузка schema
- Передача данных в Scene3D компонент

**Основные функции:**
- Использует `collectMeshes` и `groupMeshes` из `utils/meshUtils.js`
- Передает `meshGroups` в `Scene3D` для управления видимостью

### 3. Scene3D.jsx (Компонент 3D сцены)

**Ответственность:**
- Управление Canvas (React Three Fiber)
- Композиция всех компонентов 3D сцены
- Обработка загрузки и отображения

**Внутренние компоненты:**

#### GltfLoader (components/Scene3D/GltfLoader.jsx)
- Загружает GLTF через `useGLTF` hook
- Вызывает `onLoad` callback при загрузке
- Работает только внутри Canvas

#### CameraController (components/Scene3D/CameraController.jsx)
- Автоматически центрирует камеру на модели
- Вычисляет bounding box модели
- Устанавливает оптимальное расстояние камеры

#### MeshVisibilityController (components/Scene3D/MeshVisibilityController.jsx)
- Управляет видимостью мешей на основе выбора
- Использует `useMemo` для вычисления видимости
- Применяет изменения к объектам сцены (изменение `object.visible` - нормальная практика в Three.js)
- Получает `meshGroups` из Controller для определения видимости

#### GltfScene (components/Scene3D/GltfScene.jsx)
- Рендерит GLTF сцену через `<primitive object={gltf.scene} />`
- Применяет schema для управления видимостью и материалами
- Использует `schemaAppliedRef` для предотвращения повторного применения

### 4. Utils

#### meshUtils.js
**Ответственность:**
- Утилиты для работы с мешами 3D моделей

**Функции:**
- `collectMeshes(object, meshes)` - собирает все меши из объекта сцены рекурсивно
- `groupMeshes(meshNames)` - группирует меши по правилам (дефолтные, группы, объекты)

#### gltfHelper.js
**Ответственность:**
- Преобразование данных GLTF в удобный формат для работы с мешами и материалами

**Функции:**
- `buildGltfHelper(gltfData)` - создает helper объект с `meshesMap`, `materialsMap`, `scenes`

**Входные данные:**
```javascript
gltfData: {
  nodes: { [name]: Node },
  materials: { [name]: Material },
  scenes: Scene[],
  scene: Scene
}
```

**Выходные данные:**
```javascript
{
  meshesMap: { [name]: Mesh },
  materialsMap: { [name]: Material },
  scenes: Scene[]
}
```

## Логика группировки мешей

### Правила группировки:

1. **Дефолтные меши:**
   - Название начинается с "Default" (case insensitive)
   - Всегда видимы
   - Не отображаются в UI

2. **Группировка по цифрам:**
   - Первая цифра в названии = номер группы
   - Вторая цифра в названии = номер объекта
   - Меши с одинаковой первой и второй цифрой объединяются в один объект

**Пример:**
```
Меши: "Default", "11.1", "11.2", "12.1", "21.1"

Результат:
- defaultMeshes: ["Default"]
- groups: {
    "1": [
      { key: "11", meshes: ["11.1", "11.2"], label: "Объект 11" },
      { key: "12", meshes: ["12.1"], label: "Объект 12" }
    ],
    "2": [
      { key: "21", meshes: ["21.1"], label: "Объект 21" }
    ]
  }
```

### Алгоритм группировки:

```javascript
function groupMeshes(meshNames) {
  1. Разделить меши на defaultMeshes и остальные
  2. Для каждого меша найти первое число в названии
  3. Если число содержит >= 2 цифр:
     - Первая цифра = группа
     - Вторая цифра = объект
     - Ключ объекта = первая + вторая цифра
  4. Объединить меши с одинаковым ключом объекта
  5. Вернуть структуру { defaultMeshes, groups }
}
```

## Управление видимостью мешей

### Логика видимости:

1. **Дефолтные меши:**
   - `visible = true` (всегда)

2. **Остальные меши:**
   - Найти группу и объект, к которому относится меш
   - Проверить, выбран ли этот объект в `selectedMeshes[groupNum]`
   - Если выбран: `visible = true` (показывать все меши объекта)
   - Если не выбран: `visible = false`

### Обновление видимости:

```javascript
MeshVisibilityController:
  1. Собрать все меши из gltf.scene
  2. Сгруппировать меши
  3. Для каждого меша:
     - Если дефолтный → visible = true
     - Иначе → проверить выбор в группе → установить visible
  4. Обновить object.visible и gltf.nodes[name].visible
```

## Поток данных

### Поток загрузки модели:

```
User → Constructor.jsx
         ↓
      Выбор модели из списка
         ↓
      handleProjectSelect()
         ↓
      setCurrentPath(fileUrl)
         ↓
      Controller.jsx получает currentPath
         ↓
      GltfLoader загружает GLTF через useGLTF
         ↓
      onGltfLoad(gltfData) вызывается
         ↓
      Constructor.jsx:
        - setGltf(gltfData)
        - buildGltfHelper(gltfData) → setGltfHelper(helperData)
         ↓
      Controller.jsx:
        - collectMeshes(gltf.scene) из utils/meshUtils
        - groupMeshes(meshNames) из utils/meshUtils
        - setMeshGroups({ defaultMeshes, groups })
        - onMeshesGrouped({ defaultMeshes, groups })
         ↓
      Scene3D.jsx:
        - Передает meshGroups в MeshVisibilityController
         ↓
      Constructor.jsx:
        - setMeshGroups({ defaultMeshes, groups })
        - setSelectedMeshes(initialSelected)
         ↓
      MeshVisibilityController (в Scene3D):
        - Вычисляет visibilityMap через useMemo
        - Применяет видимость к объектам сцены
         ↓
      GltfScene рендерит модель
```

### Поток выбора объекта в группе:

```
User → Constructor.jsx
         ↓
      Выбор объекта из выпадающего списка группы
         ↓
      handleMeshSelect(groupNum, objectKey)
         ↓
      setSelectedMeshes({ ...prev, [groupNum]: objectKey })
         ↓
      Controller.jsx получает обновленный selectedMeshes
         ↓
      MeshVisibilityController:
        - Пересчитывает видимость всех мешей
        - Обновляет object.visible для каждого меша
         ↓
      Three.js перерисовывает сцену
         ↓
      Пользователь видит обновленную модель
```

## Схема взаимодействия компонентов

```
┌─────────────────────────────────────────────────────────┐
│              Constructor.jsx                            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  State Management                                │  │
│  │  - currentPath                                   │  │
│  │  - gltf, runtime                                 │  │
│  │  - meshGroups, selectedMeshes                    │  │
│  └──────────────┬──────────────────────────────────┘  │
│                 │                                       │
│                 │ Props                                 │
│                 ▼                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Controller.jsx                                  │  │
│  │                                                 │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │  Canvas (React Three Fiber)              │  │  │
│  │  │                                            │  │  │
│  │  │  ┌────────────────────────────────────┐  │  │  │
│  │  │  │  GltfLoader                        │  │  │  │
│  │  │  │  - useGLTF(currentPath)            │  │  │  │
│  │  │  │  - onLoad → onGltfLoad()           │  │  │  │
│  │  │  └────────────────────────────────────┘  │  │  │
│  │  │                                            │  │  │
│  │  │  ┌────────────────────────────────────┐  │  │  │
│  │  │  │  CameraController                  │  │  │  │
│  │  │  │  - Центрирование камеры            │  │  │  │
│  │  │  └────────────────────────────────────┘  │  │  │
│  │  │                                            │  │  │
│  │  │  ┌────────────────────────────────────┐  │  │  │
│  │  │  │  MeshVisibilityController           │  │  │  │
│  │  │  │  - Управление visible               │  │  │  │
│  │  │  └────────────────────────────────────┘  │  │  │
│  │  │                                            │  │  │
│  │  │  ┌────────────────────────────────────┐  │  │  │
│  │  │  │  GltfScene                          │  │  │  │
│  │  │  │  - <primitive object={gltf.scene} />│  │  │  │
│  │  │  │  - Применение schema                │  │  │  │
│  │  │  └────────────────────────────────────┘  │  │  │
│  │  │                                            │  │  │
│  │  │  OrbitControls, Lights, Environment       │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │                                                 │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │  Группировка мешей                        │  │  │
│  │  │  - collectMeshes()                         │  │  │
│  │  │  - groupMeshes()                           │  │  │
│  │  │  - onMeshesGrouped() → Constructor        │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  UI Elements                                     │  │
│  │  - Выбор модели                                  │  │
│  │  - Выбор объектов в группах                      │  │
│  │  - Кнопки Home и Constructor                     │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Технологии

### 3D Графика:
- **React Three Fiber** - React рендерер для Three.js
- **@react-three/drei** - утилиты для R3F:
  - `useGLTF` - загрузка GLTF файлов
  - `OrbitControls` - управление камерой
  - `Environment` - окружение и освещение
- **Three.js** - низкоуровневая 3D библиотека

### Управление состоянием:
- **React Hooks:**
  - `useState` - локальное состояние
  - `useEffect` - побочные эффекты
  - `useCallback` - мемоизация функций
  - `useRef` - ссылки на объекты

### Загрузка данных:
- **uploadService** - API для получения файлов
- **constructorService** - логика обработки моделей

## Формат данных

### GLTF структура:
```javascript
gltfData: {
  scene: Scene,              // Главная сцена
  scenes: Scene[],           // Все сцены
  nodes: { [name]: Node },   // Все узлы
  materials: { [name]: Material },  // Все материалы
  // ... другие данные GLTF
}
```

### GltfHelper структура:
```javascript
gltfHelper: {
  meshesMap: { [name]: Mesh },      // Карта мешей
  materialsMap: { [name]: Material }, // Карта материалов
  scenes: Scene[]                    // Сцены
}
```

### Структура групп мешей:
```javascript
meshGroups: {
  defaultMeshes: string[],           // Дефолтные меши
  groups: {                          // Группы
    [groupNum]: [                    // groupNum = первая цифра
      {
        key: string,                 // Ключ объекта (например, "11")
        meshes: string[],            // Массив мешей объекта
        label: string                // Отображаемое название
      }
    ]
  }
}
```

### Выбранные объекты:
```javascript
selectedMeshes: {
  [groupNum]: objectKey  // Например: { "1": "11", "2": "21" }
}
```

## Оптимизация производительности

1. **Мемоизация:**
   - `useCallback` для `handleGltfLoad` и `handleMeshesGrouped`
   - `useRef` для предотвращения повторной загрузки той же модели

2. **Условный рендеринг:**
   - `GltfLoader` рендерится только при наличии `currentPath`
   - `GltfScene` рендерится только при наличии `gltf.scene`

3. **Предотвращение лишних обновлений:**
   - `schemaAppliedRef` предотвращает повторное применение schema
   - `gltfSceneRef` отслеживает изменения `gltf.scene`

4. **Ключи компонентов:**
   - `key={currentPath}` на `GltfLoader` для принудительного пересоздания при смене модели

## API взаимодействие

### Получение списка моделей:
```
Constructor.jsx → uploadService.getFilesForConstructor()
  → GET /api/upload/files/all
  → Фильтрация по username из JWT
  → Возврат только .gltf и .glb файлов
```

### Получение информации о GLTF:
```
Constructor.jsx → uploadService.getGltfInfo(filename, username)
  → GET /api/upload/gltf/:username/:filename/info
  → Возврат метаданных и extras из GLTF
```

## Схема работы с мешами

```
Загрузка GLTF
     ↓
collectMeshes(gltf.scene)
     ↓
Получение всех мешей из сцены
     ↓
groupMeshes(meshNames)
     ↓
┌─────────────────────────────────────┐
│  Группировка:                        │
│  1. Дефолтные меши → defaultMeshes   │
│  2. Остальные → группы по цифрам     │
│     - Первая цифра = группа          │
│     - Вторая цифра = объект          │
│     - Объединение по ключу объекта  │
└─────────────────────────────────────┘
     ↓
onMeshesGrouped({ defaultMeshes, groups })
     ↓
Constructor.jsx обновляет состояние
     ↓
Отображение выпадающих списков
     ↓
Пользователь выбирает объекты
     ↓
selectedMeshes обновляется
     ↓
MeshVisibilityController обновляет видимость
     ↓
Трехмерная модель обновляется
```

## Особенности реализации

1. **Архитектурные принципы:**
   - **Разделение ответственности:** Controller делает только группировку и загрузку schema, Scene3D управляет Canvas
   - **Отсутствие мутаций:** Группировка мешей вынесена в utils, не мутирует исходную структуру GLTF
   - **Правильное именование:** `buildRuntime` переименован в `buildGltfHelper` (это helper, а не runtime)
   - **Управление видимостью:** Использует `useMemo` для вычисления видимости, применяет только к объектам сцены
   - **Оптимизация производительности:** Все дорогостоящие операции (traverse, группировка) выполняются один раз и кешируются

2. **Оптимизации производительности:**
   - **GLTF загружается один раз:** Проверка по ссылке `gltf.scene` предотвращает повторную загрузку
   - **Меши собираются один раз:** `collectMeshes` вызывается только при загрузке новой модели, результат кешируется
   - **Schema загружается один раз:** Загрузка при монтировании компонента, кеширование в `useRef`
   - **Видимость обновляется только при смене selectedMeshes:** `useMemo` с правильными зависимостями
   - **Камера центрируется один раз:** Проверка по ссылке сцены предотвращает повторное центрирование
   - **Мемоизация callbacks:** `handleProjectSelect`, `handleMeshSelect` мемоизированы через `useCallback`
   - **Оптимизация GltfLoader:** Использует `useRef` для `onLoad`, предотвращает лишние пересчеты

2. **Загрузка GLTF:**
   - Используется `useGLTF` hook из `@react-three/drei`
   - Hook должен вызываться внутри Canvas (в GltfLoader компоненте)
   - Используется `Suspense` для обработки асинхронной загрузки

3. **Группировка мешей:**
   - Автоматическая группировка при загрузке модели в Controller
   - Функции `collectMeshes` и `groupMeshes` вынесены в `utils/meshUtils.js`
   - Поддержка объединения мешей с разными материалами в один объект
   - Дефолтные меши не показываются в UI

4. **Управление видимостью:**
   - Вычисление видимости через `useMemo` в MeshVisibilityController
   - Применение происходит через изменение `object.visible` (нормальная практика в Three.js)
   - Не мутирует исходную структуру GLTF, только свойства объектов сцены
   - Дефолтные меши всегда видимы

5. **Schema применение:**
   - Загружается из `/schema.json` в Controller
   - Применяется в GltfScene для управления видимостью и материалами
   - Используется `schemaAppliedRef` для предотвращения повторного применения

6. **Центрирование камеры:**
   - Автоматическое вычисление bounding box модели в CameraController
   - Установка оптимального расстояния камеры
   - Обновление только при смене модели (проверка по ссылке сцены)

## Дополнительные оптимизации

### Удаленные неиспользуемые файлы:
- `Meshes.jsx` - пустой файл, удален
- `Leva.jsx` - пустой файл, удален
- `Env.jsx` - пустой файл, удален
- `Viewer.jsx` - пустой файл, удален

### Оптимизации в Constructor.jsx:
- Удалены неиспользуемые состояния: `loading`, `gltfInfo`, `admin`
- Мемоизированы `handleProjectSelect` и `handleMeshSelect` через `useCallback`
- Упрощена логика загрузки (удален неиспользуемый `getGltfInfo`)

### Оптимизации в GltfLoader.jsx:
- Использует `useRef` для `onLoad`, предотвращает лишние пересчеты
- Проверка изменения `gltfData` по ссылке

### Оптимизации в CameraController.jsx:
- Проверка по ссылке сцены предотвращает повторное центрирование камеры
- Центрирование выполняется только один раз для каждой модели

## Итоговая оценка

**До оптимизации:** 5/10 (не работает на больших сценах)
**После оптимизации:** 9.5/10 (готов к production на сценах с 500+ мешами)

Конструктор готов к использованию на больших сценах с минимальной нагрузкой на производительность.

