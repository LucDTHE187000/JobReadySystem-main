import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ScrollReveal, AnimatedCounter } from './ScrollAnimations';
import Magnetic from './Magnetic';
import { useState, useEffect } from 'react';

const HERO_IMAGES = ['/ijk.jpg', '/jkl.jpg', '/bcd.jpg', '/ghi.jpg','/abc.jpg', '/cde.jpg', '/efg.jpg'];

const stats = [
    { value: '250+', label: 'người dùng' },
    { value: '30+', label: 'doanh nghiệp' },
    { value: '150+', label: 'câu hỏi AI' },
    { value: '85%', label: 'hài lòng' },
];

export default function Hero() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const offsetX = (clientX - centerX) / centerX;
        const offsetY = (clientY - centerY) / centerY;
        setParallaxOffset({ x: offsetX, y: offsetY });
    };

    const handleMouseLeave = () => {
        setParallaxOffset({ x: 0, y: 0 });
    };

    const handleCTA = () => {
        if (user) {
            navigate('/interview');
        } else {
            navigate('/register');
        }
    };

    return (
        <section 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative min-h-[92vh] flex items-center overflow-hidden bg-transparent"
        >
            {/* Ambient Background Glows */}
            <div 
                style={{ 
                    transform: `translate3d(${parallaxOffset.x * 25}px, ${parallaxOffset.y * 25}px, 0)`,
                    transition: 'transform 0.3s ease-out'
                }}
                className="absolute top-[15%] left-[5%] pointer-events-none"
            >
                <div className="w-72 h-72 rounded-full bg-[#F5C518]/15 blur-[120px] animate-float-slow" />
            </div>

            <div 
                style={{ 
                    transform: `translate3d(${parallaxOffset.x * -40}px, ${parallaxOffset.y * -40}px, 0)`,
                    transition: 'transform 0.3s ease-out'
                }}
                className="absolute bottom-[10%] right-[10%] pointer-events-none"
            >
                <div className="w-96 h-96 rounded-full bg-[#1A3A7C]/40 blur-[130px] animate-float-reverse" />
            </div>

            <div 
                style={{ 
                    transform: `translate3d(${parallaxOffset.x * 15}px, ${parallaxOffset.y * 15}px, 0)`,
                    transition: 'transform 0.3s ease-out'
                }}
                className="absolute top-[40%] right-[20%] pointer-events-none"
            >
                <div className="w-64 h-64 rounded-full bg-[#F5C518]/5 blur-[100px] animate-float-slow" />
            </div>

            {/* Subtle diagonal pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 24px,
                        #F5C518 24px,
                        #F5C518 25px
                    )`,
                }}
            />
            <div className="absolute inset-0 bg-transparent -z-10" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left column */}
                    <ScrollReveal className="min-w-0" delay={100} type="slide" direction="up">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/25 text-[#F5C518] text-xs font-bold mb-6 uppercase tracking-widest animate-pulse">
                            🚀 AI-Powered Interview Platform
                        </div>

                        <h1 className="font-hero-title text-[clamp(2.2rem,6vw,4rem)] text-white mb-6 font-black">
                            LUYỆN TẬP
                            <br />
                            CÙNG AI —
                            <br />
                            <span className="text-gradient-gold relative inline-block hover:scale-102 transition-transform duration-300">BẮT ĐẦU NGAY</span>
                        </h1>

                        <p className="text-base sm:text-lg text-white/70 mb-8 max-w-lg leading-relaxed font-light">
                            Trải nghiệm phỏng vấn chuyên nghiệp như thật với trí tuệ nhân tạo AI thông minh, hỗ trợ phân tích câu trả lời và phản hồi chi tiết ngay lập tức.
                        </p>

                        {/* Stats bar */}
                        <div className="flex flex-wrap gap-0 mb-10 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 max-w-md">
                            {stats.map(({ value, label }, i) => (
                                <div
                                    key={label}
                                    className={`flex flex-col px-5 py-2 flex-1 min-w-[100px] ${i > 0 ? 'border-l border-white/10' : ''}`}
                                >
                                    <span className="font-heading text-2xl sm:text-3.5xl text-[#F5C518] font-black">
                                        <AnimatedCounter value={value} />
                                    </span>
                                    <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold mt-1">{label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Magnetic>
                                <button
                                    onClick={handleCTA}
                                    className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-[#F5C518] to-[#D4A800] text-[#0A2463] font-black rounded-xl shadow-lg shadow-[#F5C518]/10 hover:shadow-[#F5C518]/25 hover:scale-104 active:scale-95 transition-all duration-300 text-sm cursor-pointer"
                                >
                                    Bắt đầu miễn phí
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Magnetic>
                            <Magnetic>
                                <button
                                    onClick={() => navigate('/interview')}
                                    className="flex items-center justify-center gap-2.5 px-8 py-3.5 border border-white/20 text-white font-bold rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/15 hover:border-white/40 hover:scale-104 active:scale-95 transition-all duration-300 text-sm cursor-pointer"
                                >
                                    <Play className="w-4 h-4 fill-white/10 text-white" />
                                    Xem demo
                                </button>
                            </Magnetic>
                        </div>
                    </ScrollReveal>

                    {/* Right column — floating card */}
                    <ScrollReveal className="block mt-12 lg:mt-0" delay={300} type="scale">
                        <div className="relative group">
                            {/* Decorative ambient background halo behind image */}
                            <div className="absolute inset-0 bg-[#F5C518]/10 rounded-[32px] filter blur-xl scale-95 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />

                             <div className="rounded-3xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 p-3 shadow-2xl transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/10">
                                <div className="relative w-full h-[280px] sm:h-[350px] lg:h-[430px] overflow-hidden rounded-2xl bg-slate-950">
                                    {HERO_IMAGES.map((img, idx) => {
                                        const isCurrent = idx === currentImageIndex;
                                        const isPrevious = idx === ((currentImageIndex - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
                                        const isTransitioning = isCurrent || isPrevious;

                                        return (
                                            <img
                                                key={img}
                                                src={img}
                                                alt={`Professional interview slide ${idx}`}
                                                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                                                style={{
                                                    transform: isCurrent 
                                                        ? 'translateX(0) scale(1)' 
                                                        : isPrevious 
                                                            ? 'translateX(-100%) scale(0.95)' 
                                                            : 'translateX(100%) scale(1.05)',
                                                    opacity: isCurrent ? 1 : 0,
                                                    filter: isCurrent ? 'blur(0px)' : 'blur(8px)',
                                                    transition: isTransitioning 
                                                        ? 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.4s ease-in-out, filter 1.4s ease-in-out' 
                                                        : 'none',
                                                    zIndex: isCurrent ? 10 : 0,
                                                    pointerEvents: isCurrent ? 'auto' : 'none',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Bottom-left badge (glassmorphic) */}
                            <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md rounded-xl shadow-xl px-5 py-3.5 flex items-center gap-2.5 hover:scale-105 transition-transform duration-300 border border-white/20">
                                <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                <span className="font-extrabold text-[#0A2463] text-xs uppercase tracking-wider">Feedback tức thì</span>
                            </div>

                            {/* Top-right badge */}
                            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#F5C518] to-[#D4A800] text-[#0A2463] font-black rounded-xl px-4.5 py-2.5 shadow-lg shadow-[#F5C518]/20 font-heading text-xs uppercase tracking-widest hover:scale-105 transition-transform duration-300">
                                AI Intelligent
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
}
