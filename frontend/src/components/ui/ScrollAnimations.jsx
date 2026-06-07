import { useEffect, useState, useRef } from 'react';

/**
 * AnimatedCounter: Animates numbers counting up when scrolled into view.
 */
export function AnimatedCounter({ value, duration = 2000 }) {
    const [count, setCount] = useState(0);
    const elementRef = useRef(null);
    const hasAnimated = useRef(false);

    // Clean up value to parse number and suffix (e.g., "5,000+" -> target: 5000, suffix: "+")
    const cleanedValue = String(value).replace(/,/g, '');
    const match = cleanedValue.match(/^(\d+)(.*)$/);
    const target = match ? parseInt(match[1], 10) : 0;
    const suffix = match ? match[2] : '';

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    let startTime = null;

                    const animate = (timestamp) => {
                        if (!startTime) startTime = timestamp;
                        const progress = timestamp - startTime;
                        const percentage = Math.min(progress / duration, 1);
                        
                        // cubic-easeOut
                        const easeProgress = 1 - Math.pow(1 - percentage, 3);
                        
                        setCount(Math.floor(easeProgress * target));

                        if (percentage < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            setCount(target);
                        }
                    };

                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [target, duration]);

    const formatted = count.toLocaleString('en-US');

    return (
        <span ref={elementRef}>
            {formatted}
            {suffix}
        </span>
    );
}

/**
 * ScrollReveal: Animates components fading and sliding in when scrolled into view.
 */
export function ScrollReveal({ 
    children, 
    className = '', 
    delay = 0, 
    threshold = 0.1,
    direction = 'up',
    type = 'slide',
    duration = 1000,
    distance = 40
}) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    // Compute transition transform styles based on initial state
    let initialTransform = '';
    if (!isIntersecting) {
        if (type === 'slide' || type === 'all') {
            if (direction === 'up') initialTransform += `translateY(${distance}px)`;
            else if (direction === 'down') initialTransform += `translateY(-${distance}px)`;
            else if (direction === 'left') initialTransform += `translateX(${distance}px)`;
            else if (direction === 'right') initialTransform += `translateX(-${distance}px)`;
        }
        
        if (type === 'scale' || type === 'all') {
            initialTransform += ' scale(0.95)';
        }
    } else {
        initialTransform = 'translate(0) scale(1)';
    }

    return (
        <div
            ref={ref}
            className={`${className} transition-all ease-out transform`}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
                opacity: isIntersecting ? 1 : 0,
                transform: initialTransform,
            }}
        >
            {children}
        </div>
    );
}

