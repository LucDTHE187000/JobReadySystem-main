import { Facebook, Linkedin, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Footer({ theme = 'light' }) {
    const { user } = useAuth();
    const isDark = theme === 'dark' || !user?.email;

    return (
        <footer className={isDark ? "bg-[#030A21]/80 backdrop-blur-md text-white/70 border-t border-white/10" : "bg-gray-50 text-gray-500 border-t border-gray-100"}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-[#F5C518] flex items-center justify-center">
                                <span className="font-heading text-[#0A2463] text-lg leading-none pt-0.5">JR</span>
                            </div>
                            <span className={`font-heading text-2xl tracking-wide ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                JOB<span className="text-[#F5C518]">READY</span>
                            </span>
                        </div>
                        <p className={`text-sm mb-5 leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                            Nâng cao kỹ năng phỏng vấn cùng AI — tự tin chinh phục mọi nhà tuyển dụng.
                        </p>
                        <div className="flex gap-2">
                            {[
                                { Icon: Facebook, href: "https://www.facebook.com/profile.php?id=61590049576099" },
                                { Icon: Linkedin, href: "#" },
                                { Icon: Twitter, href: "#" },
                                { Icon: Instagram, href: "#" }
                            ].map(({ Icon, href }, i) => (
                                <a 
                                    key={i} 
                                    href={href}
                                    target={href !== "#" ? "_blank" : undefined}
                                    rel={href !== "#" ? "noopener noreferrer" : undefined}
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                                        isDark 
                                            ? 'bg-white/5 text-white/40 hover:text-[#F5C518]'
                                            : 'bg-gray-200/50 text-gray-400 hover:text-[#0A2463] hover:bg-gray-200' 
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>Về chúng tôi</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/about" className={isDark ? "text-white/60 hover:text-[#F5C518] transition-colors" : "text-gray-500 hover:text-[#0A2463] transition-colors"}>Giới thiệu</Link></li>
                            <li><Link to="/contact" className={isDark ? "text-white/60 hover:text-[#F5C518] transition-colors" : "text-gray-500 hover:text-[#0A2463] transition-colors"}>Liên hệ</Link></li>
                            <li><Link to="/terms" className={isDark ? "text-white/60 hover:text-[#F5C518] transition-colors" : "text-gray-500 hover:text-[#0A2463] transition-colors"}>Điều khoản sử dụng</Link></li>
                            <li><Link to="/privacy" className={isDark ? "text-white/60 hover:text-[#F5C518] transition-colors" : "text-gray-500 hover:text-[#0A2463] transition-colors"}>Chính sách bảo mật</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>Ứng viên</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/jobs" className={isDark ? "text-white/60 hover:text-[#F5C518] transition-colors" : "text-gray-500 hover:text-[#0A2463] transition-colors"}>Tìm việc làm</Link></li>
                            <li><Link to="/interview" className={isDark ? "text-white/60 hover:text-[#F5C518] transition-colors" : "text-gray-500 hover:text-[#0A2463] transition-colors"}>Luyện phỏng vấn AI</Link></li>
                            <li><Link to="/cv-upload" className={isDark ? "text-white/60 hover:text-[#F5C518] transition-colors" : "text-gray-500 hover:text-[#0A2463] transition-colors"}>Phân tích CV</Link></li>
                            <li><Link to="/pricing" className={isDark ? "text-white/60 hover:text-[#F5C518] transition-colors" : "text-gray-500 hover:text-[#0A2463] transition-colors"}>Bảng giá</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>Nhà tuyển dụng</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/register" className={isDark ? "text-white/60 hover:text-[#F5C518] transition-colors" : "text-gray-500 hover:text-[#0A2463] transition-colors"}>Đăng tin tuyển dụng</Link></li>
                            <li><Link to="/pricing" className={isDark ? "text-white/60 hover:text-[#F5C518] transition-colors" : "text-gray-500 hover:text-[#0A2463] transition-colors"}>Bảng giá dịch vụ</Link></li>
                            <li><Link to="/candidate-search" className={isDark ? "text-white/60 hover:text-[#F5C518] transition-colors" : "text-gray-500 hover:text-[#0A2463] transition-colors"}>Tìm ứng viên</Link></li>
                            <li><Link to="/contact" className={isDark ? "text-white/60 hover:text-[#F5C518] transition-colors" : "text-gray-500 hover:text-[#0A2463] transition-colors"}>Liên hợp tác</Link></li>
                        </ul>
                    </div>
                </div>

                <div className={`border-t pt-8 text-center ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        &copy; 2026 JobReady — Phỏng vấn thử với AI, sẵn sàng cho công việc thật.
                    </p>
                </div>
            </div>
        </footer>
    );
}
