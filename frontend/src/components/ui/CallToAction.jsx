import { ArrowRight, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ScrollReveal } from './ScrollAnimations';

export default function CallToAction() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        if (user) {
            const role = user.role;
            if (role === 'employer') navigate('/employer/dashboard');
            else if (role === 'admin') navigate('/admin/dashboard');
            else navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };
    return (
        <section className="py-20 lg:py-28 bg-transparent relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal delay={100} type="scale" direction="up">
                    <div className="relative overflow-hidden rounded-[32px] bg-white/5 backdrop-blur-md p-10 sm:p-16 lg:p-20 text-center shadow-2xl border border-white/10">
                        {/* Decorative glowing blobs */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F5C518]/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-float-slow pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1A3A7C]/40 rounded-full blur-[110px] translate-y-1/2 -translate-x-1/2 animate-float-reverse pointer-events-none" />

                        <div className="relative z-10">
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-5 leading-tight font-black tracking-tight">
                                SẴN SÀNG BẮT ĐẦU
                                <br />
                                <span className="text-gradient-gold">HÀNH TRÌNH MỚI?</span>
                            </h2>
                            <p className="text-white/70 text-base sm:text-lg mb-10 max-w-xl mx-auto font-light leading-relaxed">
                                Tham gia cộng đồng JobReady — luyện phỏng vấn AI, phân tích CV và kết nối với nhà tuyển dụng hàng đầu.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={handleRegister} 
                                    className="inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-gradient-to-r from-[#F5C518] to-[#D4A800] text-[#0A2463] rounded-xl text-base font-black shadow-lg shadow-[#F5C518]/15 hover:shadow-[#F5C518]/30 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                                >
                                    {user ? 'Vào Dashboard' : 'Đăng ký miễn phí'}
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <Link 
                                    to="/pricing" 
                                    className="inline-flex items-center justify-center gap-2.5 px-9 py-4 border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 text-white rounded-xl text-base font-bold hover:scale-105 active:scale-95 transition-all duration-300"
                                >
                                    <FileText className="w-5 h-5" />
                                    Xem bảng giá
                                </Link>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>

    );
}
