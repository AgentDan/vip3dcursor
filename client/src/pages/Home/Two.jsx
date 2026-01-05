import React, { useLayoutEffect, useRef, useMemo } from 'react';
import {useFrame, useThree} from "@react-three/fiber";
import gsap from "gsap";
import {useGLTF, useScroll, PerspectiveCamera} from "@react-three/drei";

const Two = () => {
    const tl = useRef()
    const sceneRef = useRef()
    const cameraRef = useRef()
    const vizorRef = useRef()
    const vizorRefSketch=useRef()
    const boatRef=useRef()
    const panelRef=useRef()
    const benchRef=useRef()

    const scroll = useScroll()
    const {nodes, materials} = useGLTF("./assets/models/yacht.glb")
    const { gl } = useThree();
    const bgColorRef = useRef({ r: 0.95, g: 0.96, b: 0.98 }); // Начальный цвет (светло-серый)
    const bgTl = useRef();

    // Оптимизация материалов: клонируем материалы один раз
    const clonedMaterials = useMemo(() => {
        return Object.keys(materials).reduce((acc, key) => {
            acc[key] = materials[key].clone();
            return acc;
        }, {});
    }, [materials]);

    useFrame(() => {
        if (tl.current && scroll.offset !== undefined) {
            tl.current.seek(scroll.offset * tl.current.duration())
        }
        
        // Обновление цвета фона при прокрутке
        if (bgTl.current && scroll.offset !== undefined && gl?.domElement) {
            // scroll.offset от 0 до 1, умножаем на общую длительность timeline (12)
            const timelinePosition = scroll.offset * 12;
            bgTl.current.seek(timelinePosition);
            
            // Применяем цвет к Canvas background через DOM элемент
            const canvas = gl.domElement;
            const { r, g, b } = bgColorRef.current;
            const r255 = Math.round(r * 255);
            const g255 = Math.round(g * 255);
            const b255 = Math.round(b * 255);
            canvas.style.background = `rgb(${r255}, ${g255}, ${b255})`;
        }
    })

    useLayoutEffect(() => {
        // Устанавливаем начальный светло-серый цвет фона сразу
        if (gl?.domElement) {
            const canvas = gl.domElement;
            canvas.style.background = `rgb(242, 245, 250)`;
        }

        // Создаем GSAP timeline для анимации background
        // Используем общую длительность 12 (максимальная позиция)
        bgTl.current = gsap.timeline({ 
            defaults: { ease: "power1.inOut" },
            paused: true
        });
        
        // Анимация background на грязно-серый с позиции 7 до 11
        bgTl.current
            .to(bgColorRef.current, {
                r: 0.55, // Грязно-серый компонент (140/255)
                g: 0.55, // Грязно-серый компонент (140/255)
                b: 0.55, // Грязно-серый компонент (140/255)
                duration: 4, // 11 - 7 = 4 секунды
            }, 7) // Начинаем с позиции 7
            .to(bgColorRef.current, {
                r: 0.95, // Возвращаем к исходному
                g: 0.96,
                b: 0.98,
                duration: 2,
            }, 11); // Заканчиваем на позиции 11

        // Проверяем наличие всех необходимых refs
        if (!sceneRef.current || !panelRef.current || !vizorRef.current || 
            !boatRef.current || !benchRef.current || !vizorRefSketch.current) {
            return;
        }

        // Устанавливаем прозрачность материалов изначально
        const setInitialOpacity = (ref, opacity) => {
            if (ref.current?.children) {
                ref.current.children.forEach(child => {
                    if (child.material) {
                        child.material.transparent = true;
                        child.material.opacity = opacity;
                    }
                });
            }
        };

        setInitialOpacity(panelRef, 0);
        setInitialOpacity(vizorRef, 0);
        setInitialOpacity(boatRef, 0);
        setInitialOpacity(benchRef, 0);
        if (vizorRefSketch.current?.children[0]?.material) {
            vizorRefSketch.current.children[0].material.opacity = 0.008;
        }

        // Оптимизация GSAP timeline: используем массивы материалов для групповых анимаций
        const panelMaterials = Array.from(panelRef.current.children).map(child => child.material);
        const vizorMaterials = Array.from(vizorRef.current.children).map(child => child.material);
        const boatMaterials = Array.from(boatRef.current.children).map(child => child.material);
        const benchMaterials = Array.from(benchRef.current.children).map(child => child.material);

        tl.current = gsap.timeline({defaults: {duration: 2, ease: "power1.inOut"}});
        tl.current
            .to(sceneRef.current.rotation, {y: -Math.PI/4}, 1)
            .to(sceneRef.current.position, {x: 0, y: 0, z: 0}, 1)
            .to(sceneRef.current.position, {x: -3, y: 4, z: 35}, 3)

            // Групповая анимация всех панельных материалов
            .to(panelMaterials, {opacity: 1}, 3)

            // Групповая анимация всех панельных материалов (скрытие)
            .to(panelMaterials, {opacity: 0}, 6)

            // Групповая анимация визорных материалов
            .to(vizorMaterials, {opacity: 1}, 8)
            .to(sceneRef.current.position, {x: 0, y: -1, z: 20}, 8)
            .to(sceneRef.current.rotation, {y: -Math.PI/2}, 8)

            // Групповая анимация визорных материалов (скрытие) и скамейки (показ)
            .to(vizorMaterials, {opacity: 0}, 11)
            .to(benchMaterials, {opacity: 1}, 11)
            .to(sceneRef.current.position, {x: -3, y: 6, z: 20}, 11)
            .to(sceneRef.current.rotation, {y: Math.PI/12}, 11)

            // Групповая анимация всех материалов (показ)
            .to(vizorMaterials, {opacity: 1}, 14)
            .to(boatMaterials, {opacity: 1}, 14)
            .to(panelMaterials, {opacity: 1}, 14)
            .to(vizorRefSketch.current.children[0].material, {opacity: 0}, 14)
            .to(sceneRef.current.position, {x: -4, y: -2, z: 10}, 14)
            .to(sceneRef.current.rotation, {y: -Math.PI*0.7}, 14)

            .to(sceneRef.current.position, {x: -4, y: 5, z: 10}, 22)

        return () => {
            tl.current?.kill();
            bgTl.current?.kill();
        };
    }, [gl])

    return (
        <>
            {/*<OrbitControls/>*/}
            <PerspectiveCamera
                ref={cameraRef}
                rotation={[0, 0, 0]}
                position={[0, 10, 40]}
                fov={75}
                near={0.1}
                far={1000}
                makeDefault
            />

            <group ref={sceneRef}>
                <group ref={vizorRef}>
                    <mesh
                        geometry={nodes.vizor_1.geometry}
                        material={clonedMaterials.vizorWhite}
                    />
                    <mesh
                        geometry={nodes.vizor_2.geometry}
                        material={clonedMaterials.vizorChrome}
                    />
                </group>

                <group ref={boatRef}>
                    <mesh
                        geometry={nodes.boat_1.geometry}
                        material={clonedMaterials.boatChrome}
                    />
                    <mesh
                        geometry={nodes.boat_2.geometry}
                        material={clonedMaterials.boatWhite}
                    />
                    <mesh
                        geometry={nodes.boat_3.geometry}
                        material={clonedMaterials.tik}
                    />
                    <mesh
                        geometry={nodes.boat_4.geometry}
                        material={clonedMaterials.podushka}
                    />
                </group>

                <group ref={panelRef}>
                    <mesh
                        geometry={nodes.panel_1.geometry}
                        material={clonedMaterials.panelWhite}
                    />
                    <mesh
                        geometry={nodes.panel_2.geometry}
                        material={clonedMaterials.BlackOne}
                    />
                    <mesh
                        geometry={nodes.panel_3.geometry}
                        material={clonedMaterials.BlackMat}
                    />
                    <mesh
                        geometry={nodes.panel_4.geometry}
                        material={clonedMaterials.lampGreen}
                    />
                    <mesh
                        geometry={nodes.panel_5.geometry}
                        material={clonedMaterials.lampRed}
                    />
                </group>

                <group ref={benchRef}>
                    <mesh
                        geometry={nodes.bench_1.geometry}
                        material={clonedMaterials.bench}
                    />
                    <mesh
                        geometry={nodes.bench_2.geometry}
                        material={clonedMaterials.benchWhite}
                    />
                </group>


                <group ref={vizorRefSketch}>
                    <points>
                        <bufferGeometry {...nodes.vizorSketch.geometry} />
                        <pointsMaterial
                            transparent
                            color="#41424C"
                            size={0.001}
                            sizeAttenuation={true}
                            depthWrite={false}
                            opacity={0.008}
                        />
                    </points>
                </group>

            </group>
        </>
    );
};

export default Two;