import { useState } from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { siteImages } from '../config/siteImages';
import { Check, Zap, Crown, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal, AnimatedCounter } from '../components/ui/ScrollAnimations';
import { useAuth } from '../contexts/AuthContext';

const plans = [
    {
        id: 'starter',
        name: 'Tiết kiệm',
        icon: Zap,
        price: '29,000',
        period: '',
        credits: '30 credits',
        features: [
            '30 Credits sử dụng mọi tính năng',
            'Phân tích CV & Phỏng vấn cơ bản',
            'Lưu lịch sử trong 30 ngày',
        ],
        missing: [
            'Xuất báo cáo PDF ôn tập',
            'Ưu tiên xử lý AI (Tốc độ cao)',
        ],
        cta: 'Tạo mã QR thanh toán',
        highlight: false,
    },
    {
        id: 'pro',
        name: 'Tiêu Chuẩn',
        icon: Crown,
        price: '79,000',
        period: '',
        credits: '90 credits',
        features: [
            '90 Credits sử dụng mọi tính năng',
            'Tặng thêm 10 Credits (Tổng cộng 100)',
            'Lưu lịch sử trong 90 ngày',
            'Xuất báo cáo PDF ôn tập',
        ],
        missing: [
            'Ưu tiên xử lý AI (Tốc độ cao)',
        ],
        cta: 'Tạo mã QR thanh toán',
        highlight: true,
    },
    {
        id: 'max',
        name: 'Cao cấp',
        icon: Building2,
        price: '149,000',
        period: '',
        credits: '170 credits',
        features: [
            '170 Credits sử dụng mọi tính năng',
            'Tặng thêm 30 Credits (Tổng cộng 200)',
            'Lưu lịch sử không giới hạn',
            'Xuất báo cáo PDF nâng cao',
            'Ưu tiên xử lý AI (Tốc độ cao)',
        ],
        missing: [],
        cta: 'Tạo mã QR thanh toán',
        highlight: false,
    },
];

const creditUsage = [
    { action: 'Phân tích CV nâng cao 📋✓', credits: -10 },
    { action: '1 phiên phỏng vấn AI (10 câu) 🎤🤖', credits: -20 },
    { action: 'Gói Combo (Chấm CV & Phỏng vấn) 🎁', credits: -28 },
    { action: 'Đăng tin tuyển dụng 📈', credits: 0 },
    { action: 'Tìm kiếm việc làm 🔍', credits: 0 },
];

export default function Pricing() {
    const { user } = useAuth();

    return (
        <div 
            className="min-h-screen text-white relative overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed"
            style={{ backgroundImage: `url(${siteImages.guestBg})` }}
        >
            {/* Premium backdrop-blur and dark-gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-zinc-950/70 to-black/90 backdrop-blur-[3px] pointer-events-none" />

            <Header />

            {/* Hero Section */}
            <section className="relative bg-transparent py-24 lg:py-36 overflow-hidden">
                {/* Ambient Background Glows */}
                <div className="absolute top-[10%] left-[10%] w-80 h-80 rounded-full bg-[#F5C518]/12 blur-[110px] animate-float-slow pointer-events-none" />
                <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-[#1A3A7C]/40 blur-[130px] animate-float-reverse pointer-events-none" />

                <div className="absolute inset-0">
                    <img src={siteImages.pricingHero} alt="" className="w-full h-full object-cover opacity-10" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <ScrollReveal delay={100} type="slide" direction="up">
                        <span className="inline-block px-4.5 py-1.5 bg-gradient-to-r from-[#F5C518]/20 to-[#F5C518]/5 text-[#F5C518] text-xs font-black rounded-full mb-6 uppercase tracking-widest border border-[#F5C518]/25">
                            Bảng giá
                        </span>
                        <h1 className="font-hero-title text-[clamp(2.4rem,6vw,4.25rem)] text-white mb-6 font-black">
                            CHỌN GÓI
                            <br />
                            <span className="text-gradient-gold">PHÙ HỢP VỚI BẠN</span>
                        </h1>
                        <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10 font-light">
                            Hệ thống credit linh hoạt — trả cho những gì bạn thực sự sử dụng. Không ràng buộc, hủy bất cứ lúc nào.
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Pricing cards */}
            <section className="relative py-20 lg:py-28 bg-transparent overflow-hidden">
                <div className="absolute top-[20%] left-[-10%] w-[450px] h-[450px] bg-[#0A2463]/3 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] bg-[#F5C518]/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch">
                        {plans.map((plan, i) => {
                            const Icon = plan.icon;
                            const displayPrice = plan.price;
                            let ctaLink = '/about';
                            if (plan.id === 'pro') {
                                ctaLink = '/credits';
                            } else if (plan.id === 'free') {
                                ctaLink = user ? '/dashboard' : '/register';
                            }

                            return (
                                <ScrollReveal key={plan.id} delay={150 * (i + 1)} type="all" direction="up" className="h-full">
                                    <div
                                        className={`relative rounded-[32px] p-8 sm:p-10 transition-all duration-500 h-full flex flex-col justify-between ${
                                            plan.highlight
                                                ? 'bg-gradient-to-br from-[#0A2463] via-[#09205A] to-[#051336] text-white border border-[#F5C518]/70 shadow-2xl scale-[1.03] glow-border-gold z-10'
                                                : 'bg-white/5 hover:bg-white/15 border border-white/10 text-white hover:border-[#F5C518]/30 hover:-translate-y-2 glow-border-gold'
                                        }`}
                                    >
                                        {plan.highlight && (
                                            <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 px-4.5 py-1.5 bg-[#F5C518] text-[#0A2463] text-[10px] font-black rounded-full uppercase tracking-widest shadow-md">
                                                Phổ biến nhất
                                            </div>
                                        )}

                                        <div>
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-md ${plan.highlight ? 'bg-gradient-to-tr from-[#F5C518] to-[#FFD700]' : 'bg-white/10'}`}>
                                                <Icon className={`w-6 h-6 ${plan.highlight ? 'text-[#0A2463]' : 'text-[#F5C518]'}`} />
                                            </div>

                                            <h3 className={`font-heading text-3xl font-black mb-6 ${plan.highlight ? 'text-white' : 'text-white'}`}>{plan.name}</h3>

                                            <div className="mb-3 flex items-baseline">
                                                {plan.price === 'Liên hệ' ? (
                                                    <span className={`font-heading text-4xl font-black ${plan.highlight ? 'text-[#F5C518]' : 'text-[#F5C518]'}`}>Liên hệ</span>
                                                ) : (
                                                    <>
                                                        <span className={`font-heading text-5xl font-black tracking-tight ${plan.highlight ? 'text-[#F5C518]' : 'text-[#F5C518]'}`}>
                                                            <AnimatedCounter value={displayPrice} />
                                                        </span>
                                                        {plan.price !== '0' && <span className={`text-sm ml-1.5 font-bold ${plan.highlight ? 'text-white/60' : 'text-white/60'}`}>đ{plan.period}</span>}
                                                    </>
                                                )}
                                            </div>
                                            <p className={`text-xs font-black uppercase tracking-wider mb-6 ${plan.highlight ? 'text-[#F5C518]' : 'text-[#F5C518]'}`}>{plan.credits}</p>

                                            <ul className="space-y-3.5 mb-8 pt-6 border-t border-white/5">
                                                {plan.features.map((f) => (
                                                    <li key={f} className="flex items-start gap-2.5 text-sm">
                                                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-[#F5C518]' : 'text-[#F5C518]'}`} />
                                                        <span className={plan.highlight ? 'text-white/80 font-light' : 'text-white/80 font-light'}>{f}</span>
                                                    </li>
                                                ))}
                                                {plan.missing.map((f) => (
                                                    <li key={f} className="flex items-start gap-2.5 text-sm opacity-40">
                                                        <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-center text-xs">—</span>
                                                        <span className={plan.highlight ? 'text-white/50 font-light' : 'text-white/40 font-light'}>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <Link
                                            to={`/credits?package=${plan.id}`}
                                            className={`block w-full text-center py-4 rounded-xl font-black text-sm transition-all duration-300 ${
                                                plan.highlight 
                                                    ? 'bg-gradient-to-r from-[#F5C518] to-[#D4A800] text-[#0A2463] shadow-md hover:scale-105 active:scale-95 shadow-[#F5C518]/10 hover:shadow-[#F5C518]/25' 
                                                    : 'bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95'
                                            }`}
                                        >
                                            Tạo mã QR thanh toán
                                        </Link>
                                    </div>
                                </ScrollReveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Credit usage table */}
            <section className="relative py-20 lg:py-28 bg-transparent overflow-hidden">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <ScrollReveal className="text-center mb-16" delay={100} type="slide" direction="up">
                        <h2 className="font-heading text-4xl text-white font-black tracking-tight">CREDIT <span className="text-gradient-gold">LÀ GÌ?</span></h2>
                        <p className="text-white/60 font-light mt-1">Mỗi hành động tiêu tốn một số credit nhất định</p>
                    </ScrollReveal>

                    <ScrollReveal delay={250} type="scale">
                        <div className="rounded-[24px] border border-white/10 overflow-hidden shadow-2xl bg-white/5">
                            <div className="bg-white/10 px-6 py-4.5 grid grid-cols-2 text-sm font-bold text-white uppercase tracking-wider">
                                <span>Hành động</span>
                                <span className="text-right text-[#F5C518]">Credits</span>
                            </div>
                            {creditUsage.map(({ action, credits }, i) => (
                                <div key={action} className={`px-6 py-4.5 grid grid-cols-2 text-sm border-b border-white/5 last:border-0 ${i % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}>
                                    <span className="text-white/85 font-light">{action}</span>
                                    <span className="text-right font-bold text-[#F5C518]">{credits === 0 ? 'Miễn phí' : `${credits.toLocaleString('vi-VN')} credits`}</span>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* FAQ CTA Section */}
            <section className="py-20 lg:py-28 bg-transparent relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal delay={100} type="scale" direction="up">
                        <div className="relative overflow-hidden rounded-[32px] bg-white/5 backdrop-blur-md p-10 sm:p-16 lg:p-20 text-center shadow-2xl border border-white/10">
                            {/* Decorative glowing blobs */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F5C518]/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-float-slow pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1A3A7C]/40 rounded-full blur-[110px] translate-y-1/2 -translate-x-1/2 animate-float-reverse pointer-events-none" />

                            <div className="relative z-10">
                                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-5 leading-tight font-black tracking-tight">
                                    CÒN THẮC MẮC?
                                </h2>
                                <p className="text-white/70 text-base sm:text-lg mb-10 max-w-xl mx-auto font-light leading-relaxed">
                                    Liên hệ team JobReady — chúng tôi phản hồi trong vòng 24 giờ.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link 
                                        to="/about" 
                                        className="inline-flex items-center justify-center gap-2.5 px-9 py-4 border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 text-white rounded-xl text-base font-bold hover:scale-105 active:scale-95 transition-all duration-300"
                                    >
                                        Về chúng tôi
                                    </Link>
                                    <Link 
                                        to={user ? "/dashboard" : "/register"} 
                                        className="inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-gradient-to-r from-[#F5C518] to-[#D4A800] text-[#0A2463] rounded-xl text-base font-black shadow-lg shadow-[#F5C518]/15 hover:shadow-[#F5C518]/30 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                                    >
                                        {user ? 'Vào Dashboard' : 'Dùng thử miễn phí'}
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <Footer theme="dark" />
        </div>
    );
}

