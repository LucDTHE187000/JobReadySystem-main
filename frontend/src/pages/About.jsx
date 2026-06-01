import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { siteImages, teamMembers } from '../config/siteImages';
import { Target, Eye, Heart, Award, Users, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero */}
            <section className="relative bg-navy overflow-hidden">
                <div className="absolute inset-0">
                    <img src={siteImages.aboutHero} alt="" className="w-full h-full object-cover opacity-15" />
                    <div className="absolute inset-0 bg-gradient-to-b from-navy/80 to-navy" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                    <div className="max-w-3xl animate-fade-up">
                        <span className="inline-block px-4 py-1.5 bg-gold/15 text-gold text-sm font-bold rounded-full mb-6 uppercase tracking-wide">Về chúng tôi</span>
                        <h1 className="font-heading text-[clamp(3rem,7vw,5rem)] leading-[0.95] text-white mb-6">
                            KIẾN TẠO TƯƠNG LAI
                            <br />
                            <span className="text-gold">NGHỀ NGHIỆP VIỆT NAM</span>
                        </h1>
                        <p className="text-xl text-white/60 leading-relaxed max-w-2xl">
                            JobReady được sinh ra từ một câu hỏi đơn giản: Làm sao để mọi sinh viên, dù ở đâu, đều có thể luyện phỏng vấn như một chuyên gia?
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission / Vision / Values */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
                        <div>
                            <h2 className="font-heading text-4xl sm:text-5xl text-navy mb-6">
                                CHÚNG TÔI LÀ <span className="text-gold">AI</span>
                                <br />CHO SỰ NGHIỆP
                            </h2>
                            <p className="text-gray-500 text-lg leading-relaxed mb-6">
                                JobReady kết hợp trí tuệ nhân tạo tiên tiến với hiểu biết sâu sắc về thị trường lao động Việt Nam, tạo ra trải nghiệm luyện phỏng vấn cá nhân hóa và thực tế nhất.
                            </p>
                            <p className="text-gray-500 leading-relaxed">
                                Từ phân tích CV tự động đến mô phỏng phỏng vấn theo từng vị trí cụ thể — chúng tôi đồng hành cùng bạn ở mọi bước trên hành trình tìm việc.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-3 bg-gold/20 rounded-3xl -rotate-2" />
                            <img src={siteImages.aboutMission} alt="Team collaboration" className="relative rounded-2xl w-full h-80 object-cover shadow-xl" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="card-hover p-8 rounded-2xl border border-gray-100 bg-[var(--surface)]">
                                <div className="w-14 h-14 rounded-xl bg-navy flex items-center justify-center mb-5">
                                    <Icon className="w-7 h-7 text-gold" />
                                </div>
                                <h3 className="font-heading text-2xl text-navy mb-3">{title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-navy">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {[
                            { icon: Users, value: '12,000+', label: 'Người dùng' },
                            { icon: Award, value: '850+', label: 'Doanh nghiệp' },
                            { icon: Zap, value: '5,000+', label: 'Câu hỏi AI' },
                            { icon: Target, value: '94%', label: 'Hài lòng' },
                        ].map(({ icon: Icon, value, label }) => (
                            <div key={label}>
                                <Icon className="w-8 h-8 text-gold mx-auto mb-3" />
                                <p className="font-heading text-4xl text-gold mb-1">{value}</p>
                                <p className="text-white/50 text-sm">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="font-heading text-4xl sm:text-5xl text-navy mb-4">HÀNH TRÌNH <span className="text-gold">PHÁT TRIỂN</span></h2>
                    </div>
                    <div className="max-w-2xl mx-auto space-y-8">
                        {milestones.map(({ year, event }, i) => (
                            <div key={year} className="flex gap-6 items-start">
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center font-heading text-navy text-lg flex-shrink-0">{year.slice(2)}</div>
                                    {i < milestones.length - 1 && <div className="w-0.5 h-full bg-gold/30 mt-2 min-h-[40px]" />}
                                </div>
                                <div className="pt-2">
                                    <p className="font-heading text-2xl text-navy mb-1">{year}</p>
                                    <p className="text-gray-500">{event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-16 lg:py-24 bg-[var(--surface)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
                        <div>
                            <h2 className="font-heading text-4xl sm:text-5xl text-navy mb-4">ĐỘI NGŨ <span className="text-gold">SÁNG LẬP</span></h2>
                            <p className="text-gray-500 text-lg">Sinh viên FPT University đam mê công nghệ và khát vọng khởi nghiệp</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                        {teamMembers.map(({ name, role, avatar }) => (
                            <div key={name} className="text-center card-hover">
                                <img src={avatar} alt={name} className="w-38 h-50 rounded-2xl object-cover mx-auto mb-3 border-2 border-gold/30" />
                                <h3 className="font-semibold text-navy text-sm">{name}</h3>
                                <p className="text-gold-dark text-xs">{role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-navy">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="font-heading text-4xl text-white mb-4">SẴN SÀNG THAM GIA?</h2>
                    <p className="text-white/60 mb-8">Bắt đầu luyện phỏng vấn AI miễn phí ngay hôm nay.</p>
                    <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 btn-gold rounded-xl font-bold">
                        Đăng ký ngay <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
