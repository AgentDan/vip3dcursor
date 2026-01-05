import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useControls, useStoreContext } from 'leva';
import { useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import uploadService from '../../services/upload.service';

const BackgroundLightControls = ({ model }) => {
    const { gl } = useThree();
    const [backgroundData, setBackgroundData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [intensityValue, setIntensityValue] = useState(1.0); // Состояние для intensity
    const saveTimeoutRef = useRef(null);
    const isInitialLoadRef = useRef(true);
    const controlsInitializedRef = useRef(false);

    // Загружаем background данные из GLTF при монтировании и при смене модели
    useEffect(() => {
        console.log('Model changed, loading background data for:', model?.filename); // Debug log
        // Сбрасываем флаги при смене модели
        isInitialLoadRef.current = true;
        setIsLoading(true);
        setBackgroundData(null);

        const loadBackgroundFromGltf = async () => {
            if (!model || !model.filename || !model.filename.endsWith('.gltf')) {
                // Если не GLTF файл, используем default (red)
                setBackgroundData({
                    red: 255,
                    green: 0,
                    blue: 0,
                    intensity: 1.0,
                    enabled: true
                });
                setIsLoading(false);
                controlsInitializedRef.current = true;
                return;
            }

            try {
                setIsLoading(true);
                const data = await uploadService.getGltfBackground(
                    model.filename,
                    model.username || ''
                );
                
                console.log('Loaded background data from GLTF for model:', model.filename, data); // Debug log
                
                // Используем intensity из GLTF, если он есть
                // Если intensity равен 0, это валидное значение, поэтому проверяем на undefined
                const loadedIntensity = data.intensity !== undefined ? data.intensity : 1.0;
                setBackgroundData({
                    red: data.red !== undefined ? data.red : 255,
                    green: data.green !== undefined ? data.green : 0,
                    blue: data.blue !== undefined ? data.blue : 0,
                    intensity: loadedIntensity,
                    enabled: data.enabled !== undefined ? data.enabled : true,
                    file: data.file || null // Сохраняем путь к HDRI файлу
                });
                // Обновляем состояние intensity для Leva
                setIntensityValue(loadedIntensity);
            } catch (error) {
                console.error('Error loading background from GLTF:', error);
                // В случае ошибки используем default (red)
                setBackgroundData({
                    red: 255,
                    green: 0,
                    blue: 0,
                    intensity: 1.0,
                    enabled: true
                });
            } finally {
                setIsLoading(false);
                controlsInitializedRef.current = true;
            }
        };

        loadBackgroundFromGltf();
    }, [model]);

    // Leva controls для управления светом фона Canvas в 3D viewer
    // Оставляем только intensity
    // Используем фиксированное имя папки, так как компонент пересоздается через key prop
    const folderName = "Background Light";
    const store = useStoreContext();
    
    // Используем начальное значение из состояния
    const {
        intensity
    } = useControls(folderName, {
        intensity: {
            value: intensityValue,
            min: 0,
            max: 2,
            step: 0.1,
            label: 'Intensity'
        }
    }, {
        collapsed: false
    });

    // Обновляем значение в Leva через store.set() при загрузке данных из GLTF
    useEffect(() => {
        if (!isLoading && backgroundData && backgroundData.intensity !== undefined && store) {
            console.log('Updating Leva intensity via store.set():', backgroundData.intensity, 'for model:', model?.filename); // Debug log
            setIntensityValue(backgroundData.intensity);
            
            // Обновляем значение в Leva через store
            const path = `${folderName}.intensity`;
            store.set({ [path]: backgroundData.intensity });
            
            // Проверяем, что значение обновилось
            setTimeout(() => {
                const updatedValue = store.get(path);
                console.log('Intensity in store after update:', updatedValue, 'expected:', backgroundData.intensity); // Debug log
                if (updatedValue !== backgroundData.intensity) {
                    // Пробуем еще раз, если не обновилось
                    console.warn('Intensity not updated correctly, retrying...');
                    store.set({ [path]: backgroundData.intensity });
                }
            }, 100);
            
            // Сбрасываем флаг initial load после обновления значений
            setTimeout(() => {
                isInitialLoadRef.current = false;
            }, 200);
        }
    }, [backgroundData, isLoading, model, store, folderName]);

    // Синхронизируем intensity из Leva с состоянием (когда пользователь меняет значение в Leva)
    useEffect(() => {
        if (intensity !== intensityValue && !isInitialLoadRef.current) {
            setIntensityValue(intensity);
        }
    }, [intensity]);

    // Сохраняем изменения в GLTF файл с debounce
    useEffect(() => {
        // Пропускаем первый рендер (initial load) и обновление из store.set()
        if (isInitialLoadRef.current || isLoading) {
            if (!isLoading) {
                // Даем время для обновления значений в Leva перед тем, как разрешить сохранение
                setTimeout(() => {
                    isInitialLoadRef.current = false;
                }, 200);
            }
            return;
        }

        if (!model || !model.filename || !model.filename.endsWith('.gltf')) {
            return;
        }

        // Очищаем предыдущий timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Сохраняем с задержкой 500ms
        // и только intensity из Leva контролов
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const saveData = {
                    intensity: intensity,
                };
                console.log('Saving to GLTF:', saveData); // Debug log
                await uploadService.updateGltfBackground(
                    model.filename,
                    model.username || '',
                    saveData
                );
            } catch (error) {
                console.error('Error saving background to GLTF:', error);
            }
        }, 500);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [intensity, model, isLoading]);

    // Применяем цвет к Canvas
    // Используем значения из backgroundData для цветов
    // Если есть HDRI файл, не применяем цвет фона (HDRI будет фоном)
    useEffect(() => {
        if (!gl?.domElement || isLoading || !backgroundData) return;

        const canvas = gl.domElement;
        const hdriFile = backgroundData?.file;

        // Если есть HDRI файл, делаем фон прозрачным, чтобы был виден HDRI
        if (hdriFile) {
            canvas.style.background = 'transparent';
            return;
        }

        const enabled = backgroundData.enabled ?? true;
        if (!enabled) {
            // Если отключено, возвращаем прозрачный фон
            canvas.style.background = 'transparent';
            return;
        }

        // Применяем цвет с учетом интенсивности
        const red = backgroundData.red ?? 255;
        const green = backgroundData.green ?? 0;
        const blue = backgroundData.blue ?? 0;
        
        const r = Math.round(red * intensity);
        const g = Math.round(green * intensity);
        const b = Math.round(blue * intensity);

        // Ограничиваем значения до 255
        const clampedR = Math.min(255, Math.max(0, r));
        const clampedG = Math.min(255, Math.max(0, g));
        const clampedB = Math.min(255, Math.max(0, b));

        // Устанавливаем фон Canvas в 3D viewer
        canvas.style.background = `rgb(${clampedR}, ${clampedG}, ${clampedB})`;
    }, [intensity, backgroundData, gl, isLoading]);

    // Применяем HDRI из GLTF, если указан файл
    const hdriFile = backgroundData?.file;
    // Формируем путь к HDRI файлу
    // Файлы из client/public/img/ доступны через Vite как статические ресурсы
    // В Bubble.jsx используется "./img/HDRI_sea.hdr" - относительный путь
    // Преобразуем путь из GLTF (например, /img/skyTwo.exr) в относительный путь ./img/skyTwo.exr
    let hdriPath = null;
    if (hdriFile) {
        if (hdriFile.startsWith('http')) {
            // Полный URL
            hdriPath = hdriFile;
        } else {
            // Извлекаем имя файла из пути
            // Например, /img/skyTwo.exr -> skyTwo.exr
            const fileName = hdriFile.split('/').pop();
            // Используем относительный путь, как в Bubble.jsx
            hdriPath = `./img/${fileName}`;
        }
    }

    // Управляем яркостью HDRI через intensity
    const { scene } = useThree();
    useEffect(() => {
        if (hdriPath && scene.environment) {
            // Применяем intensity к яркости HDRI
            // В Three.js можно управлять яркостью через toneMappingExposure в WebGLRenderer
            gl.toneMappingExposure = intensity;
            
            // Также пробуем управлять через scene.environment.intensity, если доступно
            if (scene.environment.intensity !== undefined) {
                scene.environment.intensity = intensity;
            }
        }
    }, [intensity, hdriPath, scene, gl]);

    return (
        <>
            {hdriPath && (
                <Suspense fallback={null}>
                    <Environment
                        files={hdriPath}
                        background={true}
                    />
                </Suspense>
            )}
        </>
    );
};

export default BackgroundLightControls;
