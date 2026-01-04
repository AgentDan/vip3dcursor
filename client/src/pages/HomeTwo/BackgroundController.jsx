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
        // Создаем GSAP timeline для анимации background
        tl.current = gsap.timeline({ defaults: { duration: 2, ease: "power1.inOut" } });
        
        // Анимация background на RGB(152, 156, 162) с позиции 7 до 12
        tl.current
            .to(bgColorRef.current, {
                r: 0.596, // Красный компонент (152/255)
                g: 0.612, // Зеленый компонент (156/255)
                b: 0.635, // Синий компонент (162/255)
                duration: 5, // 12 - 7 = 5 секунд
            }, 7) // Начинаем с позиции 7
            .to(bgColorRef.current, {
                r: 0.95, // Возвращаем к исходному
                g: 0.96,
                b: 0.98,
                duration: 2,
            }, 12); // Заканчиваем на позиции 12

        return () => {
            tl.current?.kill();
        };
    }, []);

    useFrame(() => {
        if (tl.current && scroll.offset !== undefined) {
            tl.current.seek(scroll.offset * tl.current.duration());
            
            // Применяем цвет к Canvas background через DOM элемент
            if (gl?.domElement) {
                const canvas = gl.domElement;
                const { r, g, b } = bgColorRef.current;
                const r255 = Math.round(r * 255);
                const g255 = Math.round(g * 255);
                const b255 = Math.round(b * 255);
                canvas.style.background = `rgb(${r255}, ${g255}, ${b255})`;
            }
        }
    });

    return null;
};

export default BackgroundController;

