import { useState } from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { siteImages, teamMembers } from '../config/siteImages';
import { Target, Eye, Heart, Award, Users, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal, AnimatedCounter } from '../components/ui/ScrollAnimations';
import { useAuth } from '../contexts/AuthContext';

const values = [
    { icon: Target, title: 'Sứ mệnh', desc: 'Làm chủ quá trình phỏng vấn — ai cũng có thể luyện phỏng vấn chất lượng cao, bất kể hoàn cảnh.' },
    { icon: Eye, title: 'Tầm nhìn', desc: 'Trở thành nền tảng AI hàng đầu Đông Nam Á giúp người trẻ Việt Nam tự tin bước vào thị trường lao động.' },
    { icon: Heart, title: 'Giá trị', desc: 'Minh bạch, công bằng và luôn đặt trải nghiệm người dùng lên hàng đầu trong mọi quyết định.' },
];

const milestones = [
    { year: '2026/01', event: 'Khởi động dự án EXE tại FPT University' },
    { year: '2026/02', event: 'Ra mắt tính năng phỏng vấn AI với Groq LLM và ScanCV' },
    { year: '2026/03', event: 'Giúp 100+ người dùng luyện phỏng vấn' },
    { year: '2026/04', event: 'Hợp tác với 20+ doanh nghiệp hàng đầu' },
    { year: '2026/05', event: 'Đưa mô hình Gemini flast kết hợp Groq vào phỏng vấn và ScanCV' },
    { year: '2026/06', event: 'Tiến tới mở rộng hơn 250 người dùng và 30+ doanh nghiệp' },
];


export default function About() {
    const { user } = useAuth();
    const [selectedMember, setSelectedMember] = useState(null);
    return (
        <div 
            className="min-h-screen text-white font-sans relative overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed"
            style={{ backgroundImage: `url(${siteImages.guestBg})` }}
        >
            {/* Premium backdrop-blur and dark-gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-zinc-950/70 to-black/90 backdrop-blur-[3px] pointer-events-none" />

            <Header />

            {/* Hero Section */}
            <section className="relative bg-transparent py-24 lg:py-36 overflow-hidden">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <ScrollReveal className="max-w-3xl" delay={100} type="slide" direction="up">
                            <span className="inline-block px-4.5 py-1.5 bg-gradient-to-r from-[#F5C518]/20 to-[#F5C518]/5 text-[#F5C518] text-xs font-black rounded-full mb-6 uppercase tracking-widest border border-[#F5C518]/25">
                                Về chúng tôi
                            </span>
                            <h1 className="font-hero-title text-[clamp(2.4rem,6vw,4.25rem)] text-white mb-6 font-black">
                                KIẾN TẠO TƯƠNG LAI
                                <br />
                                <span className="text-gradient-gold">BỨT PHÁ</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-white/75 leading-relaxed max-w-2xl font-light">
                                Luyện phỏng vấn thông minh cùng AI, tự tin bứt phá sự nghiệp.
                            </p>
                        </ScrollReveal>

                        {/* Right column: image from images/About_hero.png */}
                        <ScrollReveal className="hidden lg:block" delay={300} type="scale">
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-gradient-to-tr from-[#F5C518]/20 to-[#1A3A7C]/30 rounded-[32px] blur-xl opacity-60 group-hover:opacity-85 transition-opacity duration-500" />
                                <img 
                                    src="/images/About_hero.png" 
                                    alt="About Hero" 
                                    className="relative rounded-3xl w-full object-cover shadow-2xl border border-white/10" 
                                />
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Mission / Vision / Values */}
            <section className="py-20 lg:py-28 bg-transparent relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
                        <ScrollReveal delay={100} type="slide" direction="left">
                            <h2 className="font-heading text-4xl sm:text-5xl text-white mb-6 font-black tracking-tight leading-tight">
                                CHÚNG TÔI LÀ <span className="text-gradient-gold">AI</span>
                                <br />CHO SỰ NGHIỆP
                            </h2>
                            <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-6 font-light">
                                JobReady kết hợp trí tuệ nhân tạo tiên tiến với hiểu biết sâu sắc về thị trường lao động Việt Nam, tạo ra trải nghiệm luyện phỏng vấn cá nhân hóa và thực tế nhất.
                            </p>
                            <p className="text-white/60 leading-relaxed font-light">
                                Từ phân tích CV tự động đến mô phỏng phỏng vấn theo từng vị trí cụ thể — chúng tôi đồng hành cùng bạn ở mọi bước trên hành trình tìm việc.
                            </p>
                        </ScrollReveal>
                        <ScrollReveal delay={250} type="scale">
                            <div className="relative group">
                                <div className="absolute -inset-2.5 bg-[#F5C518]/10 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-500 -z-10" />
                                <img src={siteImages.aboutMission} alt="Team collaboration" className="relative rounded-2xl w-full h-84 object-cover shadow-xl border border-white/10" />
                            </div>
                        </ScrollReveal>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map(({ icon: Icon, title, desc }, i) => (
                            <ScrollReveal key={title} delay={150 * (i + 1)} type="all" direction="up">
                                <div className="bg-white/5 hover:bg-white/15 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col glow-border-gold">
                                    <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-6 shadow-md">
                                        <Icon className="w-7 h-7 text-[#F5C518]" />
                                    </div>
                                    <h3 className="font-heading text-2xl text-white mb-3 font-bold">{title}</h3>
                                    <p className="text-white/70 text-sm leading-relaxed font-light">{desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-transparent relative overflow-hidden">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
                        {[
                            { icon: Users, value: '250+', label: 'Người dùng' },
                            { icon: Award, value: '30+', label: 'Doanh nghiệp' },
                            { icon: Zap, value: '150+', label: 'Câu hỏi AI' },
                            { icon: Target, value: '85%', label: 'Hài lòng' },
                        ].map(({ icon: Icon, value, label }, i) => (
                            <ScrollReveal key={label} delay={100 * (i + 1)} type="scale">
                                <Icon className="w-8 h-8 text-[#F5C518] mx-auto mb-4 animate-pulse" />
                                <p className="font-heading text-4xl sm:text-5xl text-[#F5C518] font-black mb-2.5">
                                    <AnimatedCounter value={value} />
                                </p>
                                <p className="text-white/60 text-xs sm:text-sm font-semibold uppercase tracking-widest">{label}</p>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline (Journey) Section */}
            <section className="py-20 lg:py-28 bg-transparent relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <ScrollReveal className="text-center mb-16" delay={100} type="slide" direction="up">
                        <h2 className="font-heading text-4xl sm:text-5xl text-white font-black tracking-tight">HÀNH TRÌNH <span className="text-gradient-gold">PHÁT TRIỂN</span></h2>
                    </ScrollReveal>
                    <div className="relative max-w-5xl mx-auto">
                        {/* Central line */}
                        <div className="absolute left-4 md:left-1/2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#F5C518] via-[#FFD700]/50 to-transparent -translate-x-1/2 z-10" />

                        <div className="space-y-12 relative z-20">
                            {milestones.map(({ year, event }, i) => {
                                const isEven = i % 2 === 0;
                                return (
                                    <div key={year} className={`relative flex items-center justify-between ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row gap-8 w-full group`}>
                                        {/* Center dot */}
                                        <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-tr from-[#F5C518] to-[#FFD700] border-4 border-zinc-950 shadow-[0_0_10px_rgba(245,197,24,0.5)] z-30 transition-transform duration-300 group-hover:scale-125" />

                                        {/* Content Card */}
                                        <div className="w-full md:w-[calc(50%-2rem)] pl-10 md:pl-0">
                                            <ScrollReveal delay={100 * (i + 1)} type="slide" direction={isEven ? 'left' : 'right'}>
                                                <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 glow-border-gold hover:-translate-y-1">
                                                    <span className="inline-block px-3.5 py-1 bg-[#F5C518]/15 text-[#F5C518] border border-[#F5C518]/25 font-bold text-xs uppercase tracking-widest rounded-full mb-3">
                                                        {year}
                                                    </span>
                                                    <p className="text-white/80 leading-relaxed font-light text-sm sm:text-base">{event}</p>
                                                </div>
                                            </ScrollReveal>
                                        </div>

                                        {/* Spacer for desktop */}
                                        <div className="hidden md:block w-[calc(50%-2rem)]" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 lg:py-28 bg-transparent relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <ScrollReveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16" delay={100} type="slide" direction="up">
                        <div>
                            <span className="inline-block px-4.5 py-1.5 bg-white/10 text-white/95 border border-white/10 text-xs font-black rounded-full mb-3 uppercase tracking-widest">
                                Đội ngũ sáng lập
                            </span>
                            <h2 className="font-heading text-4xl sm:text-5xl text-white font-black tracking-tight">ĐỘI NGŨ <span className="text-gradient-gold">SÁNG LẬP</span></h2>
                            <p className="text-white/60 text-base sm:text-lg font-light mt-1">Sinh viên FPT University đam mê công nghệ và khát vọng khởi nghiệp</p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
                        {teamMembers.map((member, i) => (
                            <ScrollReveal key={member.name} delay={100 * (i + 1)} type="all" direction="up">
                                <div 
                                    onClick={() => setSelectedMember(member)}
                                    className="group text-center cursor-pointer"
                                >
                                    <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 mb-5">
                                        <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-[#F5C518] to-[#FFD700] opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none" />
                                        <div className="absolute inset-0 rounded-2xl bg-[#F5C518] rotate-6 group-hover:rotate-12 transition-transform duration-350" />
                                        <img
                                            src={member.avatar}
                                            alt={member.name}
                                            className="relative w-full h-full rounded-2xl object-cover border-2 border-white/20 transition-all duration-300 group-hover:border-[#F5C518]"
                                        />
                                    </div>
                                    <h3 className="font-bold text-white text-sm sm:text-base mb-1 group-hover:text-[#F5C518] transition-colors duration-300">{member.name}</h3>
                                    <p className="text-[#F5C518]/90 text-xs font-semibold uppercase tracking-wider scale-90">{member.role}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>

                    {/* Founder Bio Info Modal */}
                    {selectedMember && (
                        <div 
                            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
                            onClick={() => setSelectedMember(null)}
                        >
                            <div 
                                className="bg-zinc-950 border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-2xl glow-border-gold text-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close button */}
                                <button 
                                    onClick={() => setSelectedMember(null)}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-white hover:bg-[#F5C518] hover:text-[#0A2463] flex items-center justify-center font-bold transition-all"
                                >
                                    ✕
                                </button>
                                
                                {/* Avatar */}
                                <div className="relative mx-auto w-32 h-32 mb-6">
                                    <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#F5C518] to-[#FFD700] blur-sm pointer-events-none" />
                                    <img
                                        src={selectedMember.avatar}
                                        alt={selectedMember.name}
                                        className="relative w-full h-full rounded-full object-cover border-4 border-zinc-900"
                                    />
                                </div>

                                {/* Details */}
                                <h3 className="font-heading text-2xl font-black text-white mb-1">
                                    {selectedMember.name}
                                </h3>
                                <span className="inline-block px-3 py-1 bg-[#F5C518]/15 text-[#F5C518] border border-[#F5C518]/25 font-bold text-xs uppercase tracking-widest rounded-full mb-6">
                                    {selectedMember.role}
                                </span>

                                {/* Bio description */}
                                <p className="text-sm text-white/80 leading-relaxed font-light text-center border-t border-white/5 pt-5">
                                    {selectedMember.bio || 'Chưa cung cấp mô tả chi tiết.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-28 bg-transparent relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal delay={100} type="scale" direction="up">
                        <div className="relative overflow-hidden rounded-[32px] bg-white/5 backdrop-blur-md p-10 sm:p-16 lg:p-20 text-center shadow-2xl border border-white/10">
                            {/* Decorative glowing blobs */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F5C518]/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-float-slow pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1A3A7C]/40 rounded-full blur-[110px] translate-y-1/2 -translate-x-1/2 animate-float-reverse pointer-events-none" />

                            <div className="relative z-10">
                                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-5 leading-tight font-black tracking-tight">
                                    SẴN SÀNG THAM GIA?
                                </h2>
                                <p className="text-white/70 text-base sm:text-lg mb-10 max-w-xl mx-auto font-light leading-relaxed">
                                    Bắt đầu luyện phỏng vấn AI miễn phí ngay hôm nay.
                                </p>
                                <Link 
                                    to={user ? "/dashboard" : "/register"} 
                                    className="inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-gradient-to-r from-[#F5C518] to-[#D4A800] text-[#0A2463] rounded-xl text-base font-black shadow-lg shadow-[#F5C518]/15 hover:shadow-[#F5C518]/30 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                                >
                                    {user ? 'Vào Dashboard' : 'Đăng ký ngay'}
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <Footer theme="dark" />
        </div>
    );
}

