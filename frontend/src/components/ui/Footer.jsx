
import { Facebook, Linkedin, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-[#0A2463] text-white/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-[#F5C518] flex items-center justify-center">
                                <span className="font-heading text-[#0A2463] text-lg leading-none pt-0.5">JR</span>
                            </div>
                            <span className="font-heading text-2xl text-white tracking-wide">JOB<span className="text-[#F5C518]">READY</span></span>
                        </div>
                        <p className="text-sm text-white/60 mb-5 leading-relaxed">
                            Nâng cao kỹ năng phỏng vấn cùng AI — tự tin chinh phục mọi nhà tuyển dụng.
                        </p>
                        <div className="flex gap-2">
                            {[Facebook, Linkedin, Twitter, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-white/40 hover:text-[#F5C518] transition-colors">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Về chúng tôi</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/about" className="text-white/60 hover:text-white hover:text-[#F5C518] transition-colors">Giới thiệu</Link></li>
                            <li><Link to="/about" className="text-white/60 hover:text-[#F5C518] transition-colors">Liên hệ</Link></li>
                            <li><a href="#" className="text-white/60 hover:text-[#F5C518] transition-colors">Điều khoản sử dụng</a></li>
                            <li><a href="#" className="text-white/60 hover:text-[#F5C518] transition-colors">Chính sách bảo mật</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Ứng viên</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/jobs" className="text-white/60 hover:text-[#F5C518] transition-colors">Tìm việc làm</Link></li>
                            <li><Link to="/interview" className="text-white/60 hover:text-[#F5C518] transition-colors">Luyện phỏng vấn AI</Link></li>
                            <li><Link to="/cv-upload" className="text-white/60 hover:text-[#F5C518] transition-colors">Phân tích CV</Link></li>
                            <li><Link to="/pricing" className="text-white/60 hover:text-[#F5C518] transition-colors">Bảng giá</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Nhà tuyển dụng</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/register" className="text-white/60 hover:text-[#F5C518] transition-colors">Đăng tin tuyển dụng</Link></li>
                            <li><Link to="/pricing" className="text-white/60 hover:text-[#F5C518] transition-colors">Bảng giá dịch vụ</Link></li>
                            <li><a href="#" className="text-white/60 hover:text-[#F5C518] transition-colors">Tìm ứng viên</a></li>
                            <li><a href="#" className="text-white/60 hover:text-[#F5C518] transition-colors">Liên hợp tác</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 text-center">
                    <p className="text-white/40 text-xs sm:text-sm">
                        &copy; 2026 JobReady — Phỏng vấn thử với AI, sẵn sàng cho công việc thật.
                    </p>
                </div>
            </div>
        </footer>
    );
}
