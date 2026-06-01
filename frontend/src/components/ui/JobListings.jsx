import { MapPin, DollarSign, Bookmark, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteImages } from '../../config/siteImages';

const features = [
    {
        title: 'Phân tích CV tự động',
        desc: 'Upload CV và nhận điểm số, gợi ý cải thiện chi tiết trong vài giây.',
        image: siteImages.feature2,
        tag: 'Smart CV',
    },
    {
        title: 'Phỏng vấn AI thông minh',
        desc: 'Mô phỏng phỏng vấn thực tế với câu hỏi được cá nhân hóa theo vị trí và ngành nghề.',
        image: siteImages.feature1,
        tag: 'AI Powered',
    },
    {
        title: 'Kết nối nhà tuyển dụng',
        desc: 'Hàng ngàn cơ hội việc làm từ doanh nghiệp uy tín trên khắp Việt Nam.',
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
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-gold/15 text-navy text-sm font-bold rounded-full mb-4 uppercase tracking-wide">Tại sao chọn JobReady</span>
                        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-navy mb-4">
                            GIÁ TRỊ <span className="text-gold">CỐT LÕI</span>
                        </h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">Nền tảng toàn diện giúp bạn từ luyện phỏng vấn đến tìm việc làm mơ ước</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map(({ title, desc, image, tag }) => (
                            <div key={title} className="group card-hover rounded-2xl overflow-hidden border border-gray-100 bg-white">
                                <div className="relative h-52 overflow-hidden">
                                    <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                                    <span className="absolute top-4 left-4 px-3 py-1 bg-gold text-navy text-xs font-bold rounded-full">{tag}</span>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-heading text-2xl text-navy mb-2">{title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Job listings */}
            <section className="py-16 lg:py-20 bg-[var(--surface)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10">
                        <div>
                            <h2 className="font-heading text-4xl sm:text-5xl text-navy mb-2">VIỆC LÀM <span className="text-gold">NỔI BẬT</span></h2>
                            <p className="text-gray-500">Cơ hội mới nhất từ các doanh nghiệp hàng đầu</p>
                        </div>
                        <Link to="/jobs" className="inline-flex items-center gap-2 text-navy font-semibold hover:text-gold transition-colors group">
                            Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <div key={job.id} className="card-hover bg-white rounded-2xl p-6 border border-gray-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-80 h-50 ">
                                        {job.logo ? (
                                            <img src={job.logo} alt={`${job.company} logo`} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-heading text-gold text-lg">{job.company.charAt(0)}</span>
                                        )}
                                    </div>
                                    <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <Bookmark className="w-5 h-5 text-gray-300 hover:text-gold" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-navy mb-1 line-clamp-2">{job.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">{job.company}</p>
                                <div className="flex flex-col gap-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <DollarSign className="w-4 h-4 text-gold flex-shrink-0" />
                                        {job.salary}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 bg-gold/15 text-navy rounded-full text-xs font-bold">{job.type}</span>
                                    <Link to="/jobs" className="text-sm font-semibold text-navy hover:text-gold transition-colors">Xem chi tiết →</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
