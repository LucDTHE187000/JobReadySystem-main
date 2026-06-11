import { useRef, useState } from 'react';

export default function Magnetic({ children, strength = 0.35 }) {
    const containerRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;

        const { clientX, clientY } = e;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        
        // Calculate center of the stationary container
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;

        setIsHovered(true);
        setPosition({
            x: distanceX * strength,
            y: distanceY * strength
        });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setPosition({ x: 0, y: 0 });
    };

    const { x, y } = position;

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="inline-block magnetic-target"
            style={{ position: 'relative' }}
        >
            <div
                style={{
                    transform: `translate3d(${x}px, ${y}px, 0)`,
                    transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    willChange: 'transform'
                }}
            >
                {children}
            </div>
        </div>
    );
}
