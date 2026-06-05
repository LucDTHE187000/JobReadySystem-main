import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const HERO_IMAGE = '/abc.jpg';

const stats = [
    { value: '5,000+', label: 'câu hỏi' },
    { value: '12,000+', label: 'người dùng' },
    { value: '98%', label: 'hài lòng' },
];

export default function Hero() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleCTA = () => {
        if (user) {
            // Already logged in — go to relevant dashboard
            const role = user.role;
            if (role === 'employer') navigate('/employer/dashboard');
            else if (role === 'admin') navigate('/admin/dashboard');
            else navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0A2463]">
            {/* Subtle diagonal pattern */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 20px,
                        #F5C518 20px,
                        #F5C518 21px
                    )`,
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A2463] via-[#0A2463] to-[#071A4A]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left column */}
                    <div className="min-w-0">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5C518]/20 text-[#F5C518] text-sm font-semibold mb-6">
                            🚀 AI-Powered Interview Platform
                        </div>

                        <h1 className="font-heading text-[clamp(2.75rem,7vw,4.5rem)] leading-[0.95] text-white mb-6">
                            LUYỆN PHỎNG VẤN
                            <br />
                            CÙNG AI —
                            <br />
                            <span className="text-[#F5C518]">BẮT ĐẦU NGAY</span>
                        </h1>

                        <p className="text-base text-white/70 mb-8 max-w-md leading-relaxed">
                            Trải nghiệm phỏng vấn như thật với AI thông minh, phân tích câu trả lời và feedback chi tiết.
                        </p>

                        {/* Stats bar */}
                        <div className="flex flex-wrap gap-0 mb-10">
                            {stats.map(({ value, label }, i) => (
                                <div
                                    key={label}
                                    className={`flex flex-col px-5 py-2 ${i > 0 ? 'border-l border-white/20' : ''}`}
                                >
                                    <span className="font-heading text-2xl sm:text-3xl text-white">{value}</span>
                                    <span className="text-xs text-white/50 uppercase tracking-wide">{label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleCTA}
                                className="flex items-center justify-center gap-2 px-8 py-3 bg-[#F5C518] text-[#0A2463] font-bold rounded-lg shadow-lg hover:bg-[#D4A800] transition-all"
                            >
                                Bắt đầu miễn phí
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => navigate('/interview')}
                                className="flex items-center justify-center gap-2 px-8 py-3 border border-white/40 text-white rounded-lg hover:bg-white/10 transition-all"
                            >
                                <Play className="w-5 h-5" />
                                Xem demo
                            </button>
                        </div>
                    </div>

                    {/* Right column — floating card */}
                    <div className="hidden lg:block">
                        <div className="relative">
                            <div className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 p-3 shadow-2xl">
                                <img
                                    src={HERO_IMAGE}
                                    alt="Professional interview"
                                    className="w-full h-[420px] object-cover rounded-2xl"
                                />
                            </div>

                            {/* Bottom-left badge */}
                            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl px-5 py-3 flex items-center gap-2">
                                <span className="text-lg">⚡</span>
                                <span className="font-semibold text-[#0A2463] text-sm">Feedback tức thì</span>
                            </div>

                            {/* Top-right badge */}
                            <div className="absolute -top-3 -right-3 bg-[#F5C518] text-[#0A2463] font-bold rounded-xl px-4 py-2 shadow-lg font-heading text-lg tracking-wide">
                                AI Intelligent
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
