import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function CursorFollower() {
    const canvasRef = useRef(null);
    const location = useLocation();
    
    // Smooth trailing physics states stored in refs to keep React render cycles at 0
    const mouse = useRef({ x: 0, y: 0, active: false });
    const renderMouse = useRef({ x: 0, y: 0 });
    const lastRenderMouse = useRef({ x: 0, y: 0 });
    const firstMove = useRef(true);
    
    const particles = useRef([]);
    const animationFrameRef = useRef(null);
    const isAnimating = useRef(false);

    // Only active on client-facing routes
    const allowedPaths = ['/', '/about', '/contact', '/pricing'];
    const isActivePath = allowedPaths.includes(location.pathname);

    useEffect(() => {
        if (!isActivePath) return;

        // Disable on mobile/tablet viewports
        if (window.innerWidth < 768) return;

        console.log("JobReady Fustation Cursor Atmosphere: Multi-layer glow and fading trail active.");

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize handler
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Fustation Palette: 60% Emerald, 20% Mint, 15% Light Mint, 5% Faint White/Glow
        const getRandomColor = () => {
            const r = Math.random();
            if (r < 0.60) return '#10B981'; // Emerald
            if (r < 0.80) return '#34D399'; // Mint
            if (r < 0.95) return '#6EE7B7'; // Light Mint
            return '#FFFFFF';              // White/Glow spark
        };

        // Animation Loop
        const loop = () => {
            const width = canvas.width;
            const height = canvas.height;

            // 1. Motion Blur / Fading Canvas (destination-out creates organic decay/dư ảnh)
            ctx.save();
            ctx.globalCompositeOperation = "destination-out";
            ctx.fillStyle = "rgba(0, 0, 0, 0.16)"; // Fades previous draws slowly
            ctx.fillRect(0, 0, width, height);
            ctx.restore();

            // Set screen blending for glowing overlay
            ctx.globalCompositeOperation = "screen";

            // 2. Mouse Smoothing & Path Interpolation
            const dx = mouse.current.x - renderMouse.current.x;
            const dy = mouse.current.y - renderMouse.current.y;
            
            // Sweet spot smoothing factor
            const ease = 0.28;
            renderMouse.current.x += dx * ease;
            renderMouse.current.y += dy * ease;

            // Calculate movement delta of render point
            const rdx = renderMouse.current.x - lastRenderMouse.current.x;
            const rdy = renderMouse.current.y - lastRenderMouse.current.y;
            const rSpeed = Math.hypot(rdx, rdy);

            // Draw a soft trailing plasma glow cloud (sương xanh) at renderMouse
            if (mouse.current.active && rSpeed > 0.1) {
                ctx.save();
                const blobRadius = 85; // 85px soft plasma blob
                const blobGrad = ctx.createRadialGradient(
                    renderMouse.current.x, renderMouse.current.y, 0,
                    renderMouse.current.x, renderMouse.current.y, blobRadius
                );
                // Ultra soft emerald and mint mix (low opacity: 0.10 -> 0.03)
                blobGrad.addColorStop(0, 'rgba(16, 185, 129, 0.10)'); // soft emerald center
                blobGrad.addColorStop(0.4, 'rgba(52, 211, 153, 0.03)'); // fades to mint
                blobGrad.addColorStop(1, 'transparent');
                
                ctx.fillStyle = blobGrad;
                ctx.beginPath();
                ctx.arc(renderMouse.current.x, renderMouse.current.y, blobRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            if (rSpeed > 0.4 && mouse.current.active) {
                // Interpolate spawning points
                const numParticles = Math.min(Math.floor(rSpeed * 0.85) + 1, 14);
                
                for (let i = 0; i <= numParticles; i++) {
                    const t = i / numParticles;
                    const px = lastRenderMouse.current.x + rdx * t;
                    const py = lastRenderMouse.current.y + rdy * t;

                    // Push micro particle
                    particles.current.push({
                        x: px + (Math.random() - 0.5) * 3.5,
                        y: py + (Math.random() - 0.5) * 3.5,
                        // Reverse velocity inheritance: spray backwards opposite of cursor direction
                        vx: -rdx * 0.07 + (Math.random() - 0.5) * 0.8,
                        vy: -rdy * 0.07 + (Math.random() - 0.5) * 0.8,
                        size: Math.random() * 1.7 + 0.8, // Microscopic: 0.8px to 2.5px
                        alpha: Math.random() * 0.3 + 0.4, // Reduced opacity for dust feeling (0.4 to 0.7)
                        decay: Math.random() * 0.012 + 0.008,
                        color: getRandomColor(),
                        angle: Math.random() * Math.PI * 2,
                        turbulenceSpeed: Math.random() * 0.04 + 0.02
                    });
                }
            }

            // Update last render coordinates
            lastRenderMouse.current.x = renderMouse.current.x;
            lastRenderMouse.current.y = renderMouse.current.y;

            // 3. Draw and update particles
            const parts = particles.current;
            
            // Slice to prevent excessive counts
            if (parts.length > 500) {
                parts.splice(0, parts.length - 500);
            }

            for (let i = parts.length - 1; i >= 0; i--) {
                const p = parts[i];
                
                // Apply turbulence noise
                p.angle += (Math.random() - 0.5) * 0.35;
                p.vx += Math.cos(p.angle) * p.turbulenceSpeed;
                p.vy += Math.sin(p.angle) * p.turbulenceSpeed;
                
                // Apply friction
                p.vx *= 0.94;
                p.vy *= 0.94;
                
                // Update position
                p.x += p.vx;
                p.y += p.vy;
                
                // Fade out
                p.alpha -= p.decay;
                p.size -= p.decay * 0.5;

                if (p.alpha <= 0 || p.size <= 0.15) {
                    parts.splice(i, 1);
                    continue;
                }

                // Render micro fuzzy glowing point with 3-Layer Glow (bright core, medium blur, wide ambient glow)
                ctx.save();
                
                let rgb = '16, 185, 129'; // Hex #10B981
                if (p.color === '#34D399') rgb = '52, 211, 153';
                else if (p.color === '#6EE7B7') rgb = '110, 231, 183';
                else if (p.color === '#FFFFFF') rgb = '255, 255, 255';

                const radius = Math.max(0.1, p.size);

                // Layer 3: Wide ambient glow (radius * 4.0, alpha * 0.08)
                const rad3 = radius * 4.0;
                const pGrad3 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad3);
                pGrad3.addColorStop(0, `rgba(${rgb}, ${p.alpha * 0.08})`);
                pGrad3.addColorStop(1, 'transparent');
                ctx.fillStyle = pGrad3;
                ctx.beginPath();
                ctx.arc(p.x, p.y, rad3, 0, Math.PI * 2);
                ctx.fill();

                // Layer 2: Medium glow (radius * 1.8, alpha * 0.22)
                const rad2 = radius * 1.8;
                const pGrad2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad2);
                pGrad2.addColorStop(0, `rgba(${rgb}, ${p.alpha * 0.22})`);
                pGrad2.addColorStop(1, 'transparent');
                ctx.fillStyle = pGrad2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, rad2, 0, Math.PI * 2);
                ctx.fill();

                // Layer 1: Bright core (radius * 0.5, alpha * 0.9)
                const rad1 = radius * 0.5;
                const pGrad1 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad1);
                pGrad1.addColorStop(0, `rgba(${rgb}, ${p.alpha * 0.9})`);
                pGrad1.addColorStop(1, 'transparent');
                ctx.fillStyle = pGrad1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, rad1, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }

            // Sleep loop if particles are cleared and mouse is stationary
            if (parts.length > 0 || mouse.current.active) {
                animationFrameRef.current = requestAnimationFrame(loop);
            } else {
                isAnimating.current = false;
            }
        };

        const ensureAnimating = () => {
            if (!isAnimating.current) {
                isAnimating.current = true;
                loop();
            }
        };

        // Mouse Move Listener
        const handleMouseMove = (e) => {
            const x = e.clientX;
            const y = e.clientY;

            if (firstMove.current) {
                renderMouse.current.x = x;
                renderMouse.current.y = y;
                lastRenderMouse.current.x = x;
                lastRenderMouse.current.y = y;
                firstMove.current = false;
            }

            mouse.current.x = x;
            mouse.current.y = y;
            mouse.current.active = true;

            ensureAnimating();
        };

        const handleMouseLeave = () => {
            mouse.current.active = false;
        };

        const handleMouseEnter = (e) => {
            const x = e.clientX;
            const y = e.clientY;

            if (firstMove.current) {
                renderMouse.current.x = x;
                renderMouse.current.y = y;
                lastRenderMouse.current.x = x;
                lastRenderMouse.current.y = y;
                firstMove.current = false;
            } else {
                renderMouse.current.x = x;
                renderMouse.current.y = y;
                lastRenderMouse.current.x = x;
                lastRenderMouse.current.y = y;
            }

            mouse.current.x = x;
            mouse.current.y = y;
            mouse.current.active = true;
            ensureAnimating();
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);
        
        ensureAnimating();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            cancelAnimationFrame(animationFrameRef.current);
            isAnimating.current = false;
        };
    }, [isActivePath, location.pathname]);

    if (!isActivePath) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none mix-blend-screen hidden md:block"
            style={{ opacity: 0.95, zIndex: 99999 }}
        />
    );
}
