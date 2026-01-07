import React from 'react';
import {Canvas} from "@react-three/fiber";
import {ScrollControls} from "@react-three/drei";
import HeaderMain from "./HeaderMain.jsx";
import Overlay from "./Overlay.jsx";
import Bubble from "./Bubble.jsx";

const Home = () => {
    return (
        <div className="relative w-screen h-screen">
            <HeaderMain/>
            <Canvas 
              style={{background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9, #e2e8f0)'}} 
              shadows 
              camera={{position: [0, 0, 0], fov: 50, far: 50000}}
              gl={{ 
                preserveDrawingBuffer: true,
                powerPreference: "high-performance"
              }}
              onCreated={({ gl }) => {
                // Обработка потери контекста
                const canvas = gl.domElement;
                canvas.addEventListener('webglcontextlost', (event) => {
                  event.preventDefault();
                });
                canvas.addEventListener('webglcontextrestored', () => {
                  // WebGL context restored
                });
              }}
            >
                <ScrollControls pages={10} damping={0.2}>
                    <Overlay/>
                    <Bubble/>
                </ScrollControls>
            </Canvas>
        </div>
    );
};

export default Home;

