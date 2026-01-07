import {Suspense} from 'react';
import {Environment, Html, useProgress, useGLTF} from "@react-three/drei";
import Two from "./Two.jsx";

// Кэширование 3D модели: предзагрузка модели
useGLTF.preload("./assets/models/yacht.glb");

const Bubble = () => {

    const Loader = () =>{
        const {progress} = useProgress()
        return (<Html>{Math.floor(progress)}% Loaded ...</Html>)
    }

    return (
        <Suspense fallback={<Loader/>}>
            <Environment
                files="./img/HDRI_sea.hdr" // Путь к HDRI
            />
            <Two/>
        </Suspense>
    );
};

export default Bubble;