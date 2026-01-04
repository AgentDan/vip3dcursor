import React, { useRef, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import gsap from 'gsap';

const BackgroundController = () => {
    const scroll = useScroll();
    const { gl } = useThree();
    const bgColorRef = useRef({ r: 0.95, g: 0.96, b: 0.98 }); // Начальный цвет (светло-серый)
    const tl = useRef();

    useLayoutEffect(() => {
        // Устанавливаем начальный светло-серый цвет сразу
        if (gl?.domElement) {
            const canvas = gl.domElement;
            canvas.style.background = `rgb(242, 245, 250)`;
        }

        // Создаем GSAP timeline для анимации background
        // Используем общую длительность 12 (максимальная позиция)
        tl.current = gsap.timeline({ 
            defaults: { ease: "power1.inOut" },
            paused: true
        });
        
        // Анимация background на грязно-серый с позиции 7 до 11
        tl.current
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

        return () => {
            tl.current?.kill();
        };
    }, [gl]);

    useFrame(() => {
        if (tl.current && scroll.offset !== undefined && gl?.domElement) {
            // scroll.offset от 0 до 1, умножаем на общую длительность timeline (12)
            const timelinePosition = scroll.offset * 12;
            tl.current.seek(timelinePosition);
            
            // Применяем цвет к Canvas background через DOM элемент
            const canvas = gl.domElement;
            const { r, g, b } = bgColorRef.current;
            const r255 = Math.round(r * 255);
            const g255 = Math.round(g * 255);
            const b255 = Math.round(b * 255);
            canvas.style.background = `rgb(${r255}, ${g255}, ${b255})`;
        }
    });

    return null;
};

export default BackgroundController;

