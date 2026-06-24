import { API_URL } from '@/config';
import { useState, useEffect } from 'react';
import { Star, Quote, MessageSquare, Award } from 'lucide-react';
import axios from 'axios';
import { ScrollReveal } from './ScrollAnimations';

const DEFAULT_TESTIMONIALS = [
    {
        _id: 'default1',
        title: 'Vượt qua phỏng vấn tại FPT Software',
        description: 'Nhờ luyện tập với tính năng phỏng vấn AI của JobReady, mình đã chuẩn bị cực tốt cho các câu hỏi hành vi. CV được chấm 8.5 điểm giúp mình tự tin nộp hồ sơ và đã nhận được offer ngay sau đó!',
        rating: 5,
        outcome: 'Nhận Offer',
        userId: {
            name: 'Nguyễn Văn Nam',
            role: 'JOB_SEEKER'
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        _id: 'default2',
        title: 'Mẹo tối ưu CV cực kỳ hiệu quả',
        description: 'Điểm CV ban đầu của mình chỉ được 5.0. Sau khi làm theo gợi ý của JobReady để sửa cấu trúc và thêm các từ khóa chuyên ngành, điểm tăng lên 8.2 và mình lập tức nhận được lời mời phỏng vấn.',
        rating: 5,
        outcome: 'Phỏng vấn',
        userId: {
            name: 'Lê Thị Thu Hương',
            role: 'JOB_SEEKER'
        },
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        _id: 'default3',
        title: 'Tiết kiệm thời gian ôn tập',
        description: 'Hệ thống gợi ý các lộ trình học tập và câu hỏi sát thực tế của các công ty lớn. Mình không còn phải bơi trong đống tài liệu trôi nổi trên mạng nữa. Rất đáng tiền!',
        rating: 4,
        outcome: 'Đang xem xét',
        userId: {
            name: 'Trần Minh Hoàng',
            role: 'JOB_SEEKER'
        },
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    }
];

export default function Testimonials() {
    const [blogs, setBlogs] = useState([]);
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/blogs/approved`);
                setBlogs(res.data || []);
            } catch (error) {
                console.error("Fetch testimonials error:", error);
            }
        };
        fetchBlogs();
    }, []);

    // Combine dynamic blogs first, then defaults if we need more
    const displayList = [...blogs, ...DEFAULT_TESTIMONIALS].slice(0, 3);

    return (
        <section className="py-20 lg:py-28 bg-transparent relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <ScrollReveal className="text-center mb-16" delay={100} type="slide" direction="up">
                    <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-white/10 text-white/95 border border-white/10 text-xs font-black rounded-full mb-4 uppercase tracking-widest">
                        <MessageSquare size={12} className="text-white" />
                        Góc chia sẻ
                    </span>
                    <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-4 font-black tracking-tight">
                        ỨNG VIÊN <span className="text-gradient-gold font-black">CHIA SẺ TRẢI NGHIỆM</span>
                    </h2>
                    <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
                        Cảm nhận thực tế của các ứng viên đã sử dụng JobReady để nâng cấp hồ sơ và chinh phục nhà tuyển dụng thành công.
                    </p>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {displayList.map((item, i) => (
                        <ScrollReveal key={item._id} delay={150 * (i + 1)} type="all" direction="up">
                            <div 
                                onClick={() => setSelectedTestimonial(item)}
                                className="bg-white/5 hover:bg-white/15 backdrop-blur-md rounded-2xl p-7 border border-white/10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between relative group h-full glow-border-gold cursor-pointer"
                            >
                                {/* Decorative quotes */}
                                <span className="absolute top-6 right-6 text-white/5 group-hover:text-[#F5C518]/15 transition-colors duration-500 scale-105 group-hover:scale-110 pointer-events-none">
                                    <Quote size={48} className="rotate-180" />
                                </span>

                                <div className="relative z-10">
                                    {/* Badge & Star rating */}
                                    <div className="flex items-center justify-between mb-5">
                                        <span className="px-3 py-1 bg-[#F5C518]/15 text-[#D4A800] border border-[#F5C518]/25 font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 shadow-sm">
                                            <Award size={12} className="text-[#D4A800]" />
                                            {item.outcome}
                                        </span>
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star 
                                                    key={star} 
                                                    size={14} 
                                                    className={star <= item.rating ? 'fill-[#F5C518] text-[#F5C518]' : 'text-white/20'}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <h3 className="font-heading text-lg font-bold text-white mb-3 leading-snug line-clamp-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-white/85 leading-relaxed mb-6 italic font-light line-clamp-4" title={item.description}>
                                        "{item.description}"
                                    </p>
                                </div>

                                {/* Author info */}
                                <div className="flex items-center gap-3 pt-5 border-t border-white/5 mt-auto">
                                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 text-[#F5C518] font-black flex items-center justify-center shadow-md">
                                        {item.userId?.name?.charAt(0) || 'Ứ'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">{item.userId?.name || 'Ứng viên giấu tên'}</h4>
                                        <p className="text-xs text-white/50">
                                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>

            {/* Testimonial Detail Modal */}
            {selectedTestimonial && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
                    onClick={() => setSelectedTestimonial(null)}
                >
                    <div 
                        className="bg-zinc-950 border border-white/10 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl glow-border-gold text-left"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button 
                            onClick={() => setSelectedTestimonial(null)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-white hover:bg-[#F5C518] hover:text-[#0A2463] flex items-center justify-center font-bold transition-all"
                        >
                            ✕
                        </button>
                        
                        {/* Outcome & Stars */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="px-3 py-1 bg-[#F5C518]/15 text-[#D4A800] border border-[#F5C518]/25 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1">
                                <Award size={14} className="text-[#D4A800]" />
                                {selectedTestimonial.outcome}
                            </span>
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                        key={star} 
                                        size={16} 
                                        className={star <= selectedTestimonial.rating ? 'fill-[#F5C518] text-[#F5C518]' : 'text-white/20'}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-heading text-2xl font-black text-white mb-4 leading-snug">
                            {selectedTestimonial.title}
                        </h3>

                        {/* Description */}
                        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                            <p className="text-base text-white/90 leading-relaxed italic font-light whitespace-pre-wrap">
                                "{selectedTestimonial.description}"
                            </p>
                        </div>

                        {/* Author info */}
                        <div className="flex items-center gap-3 pt-5 border-t border-white/10">
                            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 text-[#F5C518] font-black text-lg flex items-center justify-center">
                                {selectedTestimonial.userId?.name?.charAt(0) || 'Ứ'}
                            </div>
                            <div>
                                <h4 className="font-bold text-base text-white">{selectedTestimonial.userId?.name || 'Ứng viên giấu tên'}</h4>
                                <p className="text-xs text-white/50">
                                    {new Date(selectedTestimonial.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
