import React, { useLayoutEffect, useRef, useMemo } from 'react';
import {useFrame} from "@react-three/fiber";
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
    })

    useLayoutEffect(() => {
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
        };
    }, [])

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