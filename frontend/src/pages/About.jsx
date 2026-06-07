import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { siteImages, teamMembers } from '../config/siteImages';
import { Target, Eye, Heart, Award, Users, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal, AnimatedCounter } from '../components/ui/ScrollAnimations';

const values = [
    { icon: Target, title: 'Sứ mệnh', desc: 'Làm chủ quá trình phỏng vấn — ai cũng có thể luyện phỏng vấn chất lượng cao, bất kể hoàn cảnh.' },
    { icon: Eye, title: 'Tầm nhìn', desc: 'Trở thành nền tảng AI hàng đầu Đông Nam Á giúp người trẻ Việt Nam tự tin bước vào thị trường lao động.' },
    { icon: Heart, title: 'Giá trị', desc: 'Minh bạch, công bằng và luôn đặt trải nghiệm người dùng lên hàng đầu trong mọi quyết định.' },
];

const milestones = [
    { year: '2026/01', event: 'Khởi động dự án EXE tại FPT University' },
    { year: '2026/02', event: 'Ra mắt tính năng phỏng vấn AI với Groq LLM và ScanCV' },
    { year: '2026/03', event: 'Giúp 1,000+ người dùng luyện phỏng vấn' },
    { year: '2026/04', event: 'Hợp tác với 50+ doanh nghiệp hàng đầu' },
    { year: '2026/05', event: 'Đưa mô hình Gemini flast kết hợp Groq vào phỏng vấn và ScanCV' },
    { year: '2026/06', event: 'Tiến tới mở rộng hơn 12,000 người dùng và 850+ doanh nghiệp' },
];


export default function About() {
    return (
        <div className="min-h-screen bg-white font-sans overflow-hidden">
            <Header />

            {/* Hero Section */}
            <section className="relative bg-[#0A2463] py-24 lg:py-36 overflow-hidden">
                {/* Ambient Glows */}
                <div className="absolute top-[10%] left-[10%] w-80 h-80 rounded-full bg-[#F5C518]/12 blur-[110px] animate-float-slow pointer-events-none" />
                <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-[#1A3A7C]/40 blur-[130px] animate-float-reverse pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A2463] via-[#081F54] to-[#05143A] -z-10" />

                <div className="absolute inset-0">
                    <img src={siteImages.aboutHero} alt="" className="w-full h-full object-cover opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0A2463]/75 via-[#0A2463]/90 to-[#0A2463]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal className="max-w-3xl" delay={100} type="slide" direction="up">
                        <span className="inline-block px-4.5 py-1.5 bg-gradient-to-r from-[#F5C518]/20 to-[#F5C518]/5 text-[#F5C518] text-xs font-black rounded-full mb-6 uppercase tracking-widest border border-[#F5C518]/25">
                            Về chúng tôi
                        </span>
                        <h1 className="font-hero-title text-[clamp(2.4rem,6vw,4.25rem)] text-white mb-6 font-black">
                            KIẾN TẠO TƯƠNG LAI
                            <br />
                            <span className="text-gradient-gold">BỨT PHÁ</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl font-light">
                            JobReady được sinh ra từ một câu hỏi đơn giản: Làm sao để mọi sinh viên, dù ở đâu, đều có thể luyện phỏng vấn như một chuyên gia?
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Mission / Vision / Values */}
            <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
                <div className="absolute top-[20%] left-[-10%] w-[450px] h-[450px] bg-[#0A2463]/3 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] bg-[#F5C518]/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
                        <ScrollReveal delay={100} type="slide" direction="left">
                            <h2 className="font-heading text-4xl sm:text-5xl text-[#0A2463] mb-6 font-black tracking-tight leading-tight">
                                CHÚNG TÔI LÀ <span className="text-gradient-gold">AI</span>
                                <br />CHO SỰ NGHIỆP
                            </h2>
                            <p className="text-[#5A6482] text-base sm:text-lg leading-relaxed mb-6 font-light">
                                JobReady kết hợp trí tuệ nhân tạo tiên tiến với hiểu biết sâu sắc về thị trường lao động Việt Nam, tạo ra trải nghiệm luyện phỏng vấn cá nhân hóa và thực tế nhất.
                            </p>
                            <p className="text-[#5A6482] leading-relaxed font-light">
                                Từ phân tích CV tự động đến mô phỏng phỏng vấn theo từng vị trí cụ thể — chúng tôi đồng hành cùng bạn ở mọi bước trên hành trình tìm việc.
                            </p>
                        </ScrollReveal>
                        <ScrollReveal delay={250} type="scale">
                            <div className="relative group">
                                <div className="absolute -inset-2.5 bg-[#F5C518]/20 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-500 -z-10" />
                                <img src={siteImages.aboutMission} alt="Team collaboration" className="relative rounded-2xl w-full h-84 object-cover shadow-xl border border-gray-100" />
                            </div>
                        </ScrollReveal>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map(({ icon: Icon, title, desc }, i) => (
                            <ScrollReveal key={title} delay={150 * (i + 1)} type="all" direction="up">
                                <div className="glass-card glow-border-gold p-8 rounded-2xl border border-gray-100/50 shadow-sm hover:shadow-2xl hover:shadow-[#0A2463]/5 hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#0A2463] to-[#1A3A7C] flex items-center justify-center mb-6 shadow-md shadow-[#0A2463]/10">
                                        <Icon className="w-7 h-7 text-[#F5C518]" />
                                    </div>
                                    <h3 className="font-heading text-2xl text-[#0A2463] mb-3 font-bold">{title}</h3>
                                    <p className="text-[#5A6482] text-sm leading-relaxed font-light">{desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-[#0A2463] relative overflow-hidden">
                {/* Ambient glow blobs */}
                <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] bg-[#F5C518]/10 rounded-full blur-[100px] animate-float-slow pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[20%] w-[350px] h-[350px] bg-[#F5C518]/8 rounded-full blur-[100px] animate-float-reverse pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A2463] via-[#081F54] to-[#05143A] -z-10" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
                        {[
                            { icon: Users, value: '12,000+', label: 'Người dùng' },
                            { icon: Award, value: '850+', label: 'Doanh nghiệp' },
                            { icon: Zap, value: '5,000+', label: 'Câu hỏi AI' },
                            { icon: Target, value: '94%', label: 'Hài lòng' },
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
            <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <ScrollReveal className="text-center mb-16" delay={100} type="slide" direction="up">
                        <h2 className="font-heading text-4xl sm:text-5xl text-[#0A2463] font-black tracking-tight">HÀNH TRÌNH <span className="text-gradient-gold">PHÁT TRIỂN</span></h2>
                    </ScrollReveal>
                    <div className="max-w-2xl mx-auto space-y-10">
                        {milestones.map(({ year, event }, i) => (
                            <ScrollReveal key={year} delay={100 * (i + 1)} type="all" direction="up">
                                <div className="flex gap-6 items-start group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#F5C518] to-[#FFD700] flex items-center justify-center font-heading text-[#0A2463] text-lg font-black flex-shrink-0 shadow-lg shadow-[#F5C518]/25 group-hover:scale-110 transition-transform duration-300">
                                            {year.slice(2)}
                                        </div>
                                        {i < milestones.length - 1 && <div className="w-0.5 h-full bg-[#F5C518]/30 mt-3 min-h-[50px]" />}
                                    </div>
                                    <div className="pt-2">
                                        <p className="font-heading text-2xl text-[#0A2463] mb-1.5 font-bold group-hover:text-[#F5C518] transition-colors duration-300">{year}</p>
                                        <p className="text-[#5A6482] leading-relaxed font-light">{event}</p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 lg:py-28 bg-[#F4F6FB] relative overflow-hidden">
                <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-[#0A2463]/3 rounded-full blur-[110px] pointer-events-none" />
                <div className="absolute bottom-[10%] right-[-10%] w-[450px] h-[450px] bg-[#F5C518]/6 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <ScrollReveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16" delay={100} type="slide" direction="up">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-[#0A2463]/5 text-[#0A2463] text-xs font-black rounded-full mb-3 uppercase tracking-widest border border-navy/5">
                                Đội ngũ sáng lập
                            </span>
                            <h2 className="font-heading text-4xl sm:text-5xl text-[#0A2463] font-black tracking-tight">ĐỘI NGŨ <span className="text-gradient-gold">SÁNG LẬP</span></h2>
                            <p className="text-[#5A6482] text-base sm:text-lg font-light mt-1">Sinh viên FPT University đam mê công nghệ và khát vọng khởi nghiệp</p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
                        {teamMembers.map(({ name, role, avatar }, i) => (
                            <ScrollReveal key={name} delay={100 * (i + 1)} type="all" direction="up">
                                <div className="group text-center cursor-pointer">
                                    <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 mb-5">
                                        <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-[#F5C518] to-[#FFD700] opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none" />
                                        <div className="absolute inset-0 rounded-2xl bg-[#F5C518] rotate-6 group-hover:rotate-12 transition-transform duration-350" />
                                        <img
                                            src={avatar}
                                            alt={name}
                                            className="relative w-full h-full rounded-2xl object-cover border-2 border-white/20 transition-all duration-300 group-hover:border-[#F5C518]"
                                        />
                                    </div>
                                    <h3 className="font-bold text-[#0A2463] text-sm sm:text-base mb-1 group-hover:text-[#F5C518] transition-colors duration-300">{name}</h3>
                                    <p className="text-[#F5C518]/90 text-xs font-semibold uppercase tracking-wider scale-90">{role}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal delay={100} type="scale" direction="up">
                        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0A2463] via-[#09205A] to-[#051336] p-10 sm:p-16 lg:p-20 text-center shadow-2xl border border-white/10">
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
                                    to="/register" 
                                    className="inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-gradient-to-r from-[#F5C518] to-[#D4A800] text-[#0A2463] rounded-xl text-base font-black shadow-lg shadow-[#F5C518]/15 hover:shadow-[#F5C518]/30 hover:scale-104 active:scale-95 transition-all duration-300 cursor-pointer"
                                >
                                    Đăng ký ngay
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <Footer />
        </div>
    );
}

