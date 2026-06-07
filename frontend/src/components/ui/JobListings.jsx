import { MapPin, DollarSign, Bookmark, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteImages } from '../../config/siteImages';
import { ScrollReveal } from './ScrollAnimations';

const features = [
    {
        title: 'Phân tích CV tự động',
        desc: 'Upload CV và nhận điểm số, gợi ý cải thiện chi tiết trong vài giây từ AI chuyên nghiệp.',
        image: siteImages.feature2,
        tag: 'Smart CV',
    },
    {
        title: 'Phỏng vấn AI thông minh',
        desc: 'Mô phỏng phỏng vấn thực tế với câu hỏi được cá nhân hóa theo vị trí và ngành nghề cụ thể.',
        image: siteImages.feature1,
        tag: 'AI Powered',
    },
    {
        title: 'Kết nối nhà tuyển dụng',
        desc: 'Hàng ngàn cơ hội việc làm hấp dẫn từ các doanh nghiệp uy tín hàng đầu trên khắp Việt Nam.',
        image: siteImages.feature3,
        tag: 'Job Board',
    },
];

const jobs = [
    { id: 1, title: 'Senior Frontend Engineer', company: 'Tech Corp', location: 'Hà Nội', salary: '20-30 triệu', type: 'Full-time', logo: '/a1.jpg' },
    { id: 2, title: 'UI/UX Designer', company: 'Design Studio', location: 'TP. HCM', salary: '15-25 triệu', type: 'Full-time', logo: '/a2.jpg' },
    { id: 3, title: 'Digital Marketing Lead', company: 'Marketing Pro', location: 'Đà Nẵng', salary: '18-28 triệu', type: 'Remote', logo: '/a3.jpg' },
];

export default function JobListings() {
    return (
        <>
            {/* Features section */}
            <section className="py-20 lg:py-28 bg-transparent relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <ScrollReveal className="text-center mb-16" delay={100} type="slide" direction="up">
                        <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-white/10 text-white/90 border border-white/10 text-xs font-black rounded-full mb-4 uppercase tracking-widest">
                            Tại sao chọn JobReady
                        </span>
                        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-4 font-black tracking-tight">
                            GIÁ TRỊ <span className="text-[#F5C518]">CỐT LÕI</span>
                        </h2>
                        <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
                            Nền tảng toàn diện đồng hành cùng bạn trên mọi nấc thang sự nghiệp, từ luyện phỏng vấn tới chạm tay vào cơ hội mơ ước.
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                        {features.map(({ title, desc, image, tag }, i) => (
                            <ScrollReveal key={title} delay={150 * (i + 1)} type="all" direction="up">
                                <div className="group rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/15 backdrop-blur-md shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full glow-border-gold">
                                    <div className="relative h-56 overflow-hidden bg-white/5">
                                        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#030A21]/70 via-transparent to-transparent" />
                                        <span className="absolute top-4 left-4 px-3 py-1.5 bg-[#F5C518] text-[#0A2463] text-[10px] font-black rounded-lg uppercase tracking-wider shadow-md">{tag}</span>
                                    </div>
                                    <div className="p-7 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-heading text-xl font-bold text-white mb-3 group-hover:text-[#F5C518] transition-colors duration-300">{title}</h3>
                                            <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-light">{desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Job listings */}
            <section className="py-20 lg:py-28 bg-transparent relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <ScrollReveal className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-12" delay={100} type="slide" direction="up">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 text-white/95 border border-white/10 text-[10px] font-black rounded-lg mb-2.5 uppercase tracking-widest">Tuyển dụng hot</span>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white font-black tracking-tight">VIỆC LÀM <span className="text-gradient-gold">NỔI BẬT</span></h2>
                            <p className="text-xs sm:text-sm text-white/60 mt-1 font-light">Cơ hội bứt phá nghề nghiệp mới nhất từ đối tác uy tín</p>
                        </div>
                        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white font-bold hover:text-[#F5C518] transition-colors group">
                            Xem tất cả công việc <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                        </Link>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {jobs.map((job, i) => (
                            <ScrollReveal key={job.id} delay={150 * (i + 1)} type="all" direction="up">
                                <div className="bg-white/5 hover:bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between h-full group glow-border-gold">
                                    <div>
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="w-13 h-13 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 transition-transform duration-500 group-hover:scale-108 group-hover:rotate-3">
                                                {job.logo ? (
                                                    <img src={job.logo} alt={`${job.company} logo`} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-heading text-[#F5C518] font-extrabold text-xl">{job.company.charAt(0)}</span>
                                                )}
                                            </div>
                                            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/40 hover:text-[#F5C518] cursor-pointer">
                                                <Bookmark className="w-5 h-5 fill-current" />
                                            </button>
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-[#F5C518] transition-colors duration-300">{job.title}</h3>
                                        <p className="text-xs sm:text-sm text-white/70 mb-5 font-semibold">{job.company}</p>
                                        <div className="flex flex-col gap-3 mb-6 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2.5 text-xs text-white/80 font-bold">
                                                <MapPin className="w-4 h-4 text-[#F5C518] flex-shrink-0" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center gap-2.5 text-xs text-white/80 font-bold">
                                                <DollarSign className="w-4 h-4 text-[#F5C518] flex-shrink-0" />
                                                {job.salary}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                        <span className="px-3 py-1 bg-white/10 text-white/90 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest">{job.type}</span>
                                        <Link to="/jobs" className="text-xs font-black text-white hover:text-[#F5C518] transition-colors flex items-center gap-0.5">Ứng tuyển ngay →</Link>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
