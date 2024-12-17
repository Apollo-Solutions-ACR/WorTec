import React, { useRef, useState, useEffect } from 'react';
import { useSpring, animated, useSprings } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';

const BUTTON_SIZE = 56; // Tamaño del botón
const ICON_SPACING = 10; // Espaciado entre íconos

export const FloatingOpButton = ({ children }) => {
    const buttonRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);

    // Convertir children en array si no lo es
    const childArray = Array.isArray(children) ? children : [children];

    // Estado de la posición del botón flotante
    const [{ x, y }, api] = useSpring(() => ({
        x: window.innerWidth / 2 - BUTTON_SIZE / 2, // Centrar el botón inicialmente
        y: window.innerHeight / 2 - BUTTON_SIZE / 2,
    }));

    // Mantén el botón centrado al cambiar el tamaño de la ventana
    useEffect(() => {
        const handleResize = () => {
            api.start({
                x: window.innerWidth / 2 - BUTTON_SIZE / 2,
                y: window.innerHeight / 2 - BUTTON_SIZE / 2,
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [api]);

    // Sprites de animación para los íconos hijos
    const [avatarSprings, avatarApi] = useSprings(childArray.length, index => ({
        y: 50, // Los íconos se inician por debajo del botón
    }));

    // Lógica de drag y hover
    const bindGestures = useGesture({
        onDrag: ({ down, movement: [mx, my], offset: [ox, oy] }) => {
            const bounds = {
                top: 0,
                left: 0,
                right: window.innerWidth - BUTTON_SIZE,
                bottom: window.innerHeight - BUTTON_SIZE,
            };
            api.start({
                x: Math.min(Math.max(ox, bounds.left), bounds.right),
                y: Math.min(Math.max(oy, bounds.top), bounds.bottom),
                immediate: down,
            });
        },
        onHover: ({ hovering }) => {
            setIsVisible(hovering);
            avatarApi.start({ y: hovering ? 0 : 50 }); // Ajusta las posiciones de animación
        },
    }, { drag: { from: () => [x.get(), y.get()] } });

    return (
        <animated.div
            className="fixed"
            style={{
                width: BUTTON_SIZE,
                height: BUTTON_SIZE,
                zIndex: 1,
                touchAction: 'none',
                userSelect: 'none',
                left: x.to(val => `${val}px`),
                top: y.to(val => `${val}px`),
                transform: 'translate(-50%, -50%)',
            }}
            {...bindGestures()}
        >
            <div
                ref={buttonRef}
                className="relative rounded-full bg-white shadow-lg flex items-center justify-center"
                style={{
                    width: BUTTON_SIZE,
                    height: BUTTON_SIZE,
                    touchAction: 'none',
                }}
            >
                {/* Ícono o contenido del botón flotante */}
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#1a1a1a" viewBox="0 0 256 256">
                    <rect width="256" height="256" fill="none"></rect>
                    <path d="M128,24A104,104,0,0,0,36.8,178l-8.5,29.9a16.1,16.1,0,0,0,4,15.8,15.8,15.8,0,0,0,15.7,4l30-8.5A104,104,0,1,0,128,24Zm32,128H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Zm0-32H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Z"></path>
                </svg>
            </div>

            {/* Mostrar los children solo si el mouse está sobre el botón */}
            {isVisible && (
                <div
                    className="absolute"
                    style={{
                        width: '200px', // Ajusta el ancho según tus necesidades
                        left: '50%', // Centrarse horizontalmente
                        transform: 'translateX(-50%)', // Ajusta para centrar en relación al botón
                        top: `-${BUTTON_SIZE + ICON_SPACING}px`, // Ajusta la posición vertical
                        zIndex: 2, // Asegúrate de que los íconos estén por encima del botón
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    {avatarSprings.map((springs, index) => (
                        <animated.div
                            key={index}
                            style={{
                                transform: springs.y.to(y => `translateY(${y}px)`),
                                marginBottom: index === childArray.length - 1 ? ICON_SPACING * 5 : ICON_SPACING, // Último div con margen inferior más grande
                            }}
                        >

                            {childArray[index]}
                        </animated.div>
                    ))}
                </div>
            )}
        </animated.div>
    );
};
