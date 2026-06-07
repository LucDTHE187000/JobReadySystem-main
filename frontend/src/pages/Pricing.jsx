import { useState } from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { siteImages } from '../config/siteImages';
import { Check, Zap, Crown, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal, AnimatedCounter } from '../components/ui/ScrollAnimations';

const plans = [
    {
        id: 'free',
        name: 'Miễn phí',
        icon: Zap,
        price: '0 ',
        period: '',
        credits: '14,000 credits/user',
        desc: 'Dành cho người mới bắt đầu muốn trải nghiệm ',
        features: [
            '3 phiên phỏng vấn AI chuyên sâu',
            'Phân tích 4CV ',
            'Tìm kiếm việc làm',
            'Lịch sử phỏng vấn',
        ],
        missing: ['Feedback chi tiết AI', 'Tin tuyển dụng premium', 'Analytics nâng cao'],
        cta: 'Bắt đầu miễn phí',
        highlight: false,
    },
    {
        id: 'pro',
        name: 'Tiêu Chuẩn',
        icon: Crown,
        price: '69,000',
        period: '',
        credits: '20,000 credits/user',
        desc: 'Cho ứng viên nghiêm túc tìm việc',
        features: [
            'Không giới hạn phỏng vấn AI',
            'Phân tích CV nâng cao + điểm số',
            'Feedback chi tiết từng câu trả lời',
            'Analytics & xu hướng tiến bộ',
            'Ưu tiên hiển thị hồ sơ',
            'Hỗ trợ email 24/7',
        ],
        missing: [],
        cta: 'Nâng cấp Pro',
        highlight: true,
    },
    {
        id: 'enterprise',
        name: 'Doanh nghiệp',
        icon: Building2,
        price: 'Liên hệ',
        period: '',
        credits: 'Không giới hạn',
        desc: 'Cho nhà tuyển dụng và HR team',
        features: [
            'Đăng tin tuyển dụng premium',
            'Quản lý ứng viên không giới hạn',
            'Tìm kiếm ứng viên theo kỹ năng',
            'Báo cáo tuyển dụng chi tiết',
            'Tích hợp API',
            'Account manager riêng',
        ],
        missing: [],
        cta: 'Liên hệ sales',
        highlight: false,
    },
];

const creditUsage = [
    { action: '1 phiên phỏng vấn AI (10 câu) 🎤🤖', credits: 4000 },
    { action: 'Phân tích CV nâng cao 📋✓', credits: 500 },
    { action: 'Đăng tin tuyển dụng 📈', credits: 0 },
    { action: 'Tìm kiếm việc làm 🔍', credits: 2000 },
];

export default function Pricing() {
    const [billing, setBilling] = useState('monthly');

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            <Header />

            {/* Hero Section */}
            <section className="relative bg-[#0A2463] py-24 lg:py-36 overflow-hidden">
                {/* Ambient Background Glows */}
                <div className="absolute top-[10%] left-[10%] w-80 h-80 rounded-full bg-[#F5C518]/12 blur-[110px] animate-float-slow pointer-events-none" />
                <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-[#1A3A7C]/40 blur-[130px] animate-float-reverse pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A2463] via-[#081F54] to-[#05143A] -z-10" />

                <div className="absolute inset-0">
                    <img src={siteImages.pricingHero} alt="" className="w-full h-full object-cover opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0A2463]/75 via-[#0A2463]/90 to-[#0A2463]" />
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

                        {/* Billing toggle */}
                        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-md">
                            <button
                                onClick={() => setBilling('monthly')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${billing === 'monthly' ? 'bg-[#F5C518] text-[#0A2463] shadow-md' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                            >
                                Hàng tháng
                            </button>
                            <button
                                onClick={() => setBilling('yearly')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${billing === 'yearly' ? 'bg-[#F5C518] text-[#0A2463] shadow-md' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                            >
                                Hàng năm
                                <span className="text-[10px] bg-navy/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">-20%</span>
                            </button>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Pricing cards */}
            <section className="py-20 lg:py-28 bg-[#F4F6FB] relative overflow-hidden">
                <div className="absolute top-[20%] left-[-10%] w-[450px] h-[450px] bg-[#0A2463]/3 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] bg-[#F5C518]/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch">
                        {plans.map((plan, i) => {
                            const Icon = plan.icon;
                            const displayPrice = billing === 'yearly' && plan.price !== '0' && plan.price !== 'Liên hệ'
                                ? Math.round(Number.parseInt(plan.price.replaceAll(',', ''), 10) * 0.8).toLocaleString('vi-VN')
                                : plan.price;
                            let ctaLink = '/about';
                            if (plan.id === 'pro') {
                                ctaLink = '/credits';
                            } else if (plan.id === 'free') {
                                ctaLink = '/register';
                            }

                            return (
                                <ScrollReveal key={plan.id} delay={150 * (i + 1)} type="all" direction="up" className="h-full">
                                    <div
                                        className={`relative rounded-[32px] p-8 sm:p-10 transition-all duration-500 h-full flex flex-col justify-between ${
                                            plan.highlight
                                                ? 'bg-gradient-to-br from-[#0A2463] via-[#09205A] to-[#051336] text-white border border-[#F5C518]/70 shadow-2xl scale-[1.03] glow-border-gold z-10'
                                                : 'bg-white/90 backdrop-blur-md border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-[#0A2463]/5 hover:-translate-y-2 glow-border-navy'
                                        }`}
                                    >
                                        {plan.highlight && (
                                            <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 px-4.5 py-1.5 bg-[#F5C518] text-[#0A2463] text-[10px] font-black rounded-full uppercase tracking-widest shadow-md">
                                                Phổ biến nhất
                                            </div>
                                        )}

                                        <div>
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-md ${plan.highlight ? 'bg-gradient-to-tr from-[#F5C518] to-[#FFD700]' : 'bg-[#0A2463]/5'}`}>
                                                <Icon className={`w-6 h-6 ${plan.highlight ? 'text-[#0A2463]' : 'text-[#0A2463]'}`} />
                                            </div>

                                            <h3 className={`font-heading text-3xl font-black mb-1.5 ${plan.highlight ? 'text-white' : 'text-[#0A2463]'}`}>{plan.name}</h3>
                                            <p className={`text-sm mb-6 font-light ${plan.highlight ? 'text-white/70' : 'text-[#5A6482]'}`}>{plan.desc}</p>

                                            <div className="mb-3 flex items-baseline">
                                                {plan.price === 'Liên hệ' ? (
                                                    <span className={`font-heading text-4xl font-black ${plan.highlight ? 'text-[#F5C518]' : 'text-[#0A2463]'}`}>Liên hệ</span>
                                                ) : (
                                                    <>
                                                        <span className={`font-heading text-5xl font-black tracking-tight ${plan.highlight ? 'text-[#F5C518]' : 'text-[#0A2463]'}`}>
                                                            <AnimatedCounter value={displayPrice} />
                                                        </span>
                                                        {plan.price !== '0' && <span className={`text-sm ml-1.5 font-bold ${plan.highlight ? 'text-white/60' : 'text-[#5A6482]'}`}>đ{plan.period}</span>}
                                                    </>
                                                )}
                                            </div>
                                            <p className={`text-xs font-black uppercase tracking-wider mb-6 ${plan.highlight ? 'text-[#F5C518]' : 'text-[#D4A800]'}`}>{plan.credits}</p>

                                            <ul className="space-y-3.5 mb-8 pt-6 border-t border-gray-100/50">
                                                {plan.features.map((f) => (
                                                    <li key={f} className="flex items-start gap-2.5 text-sm">
                                                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-[#F5C518]' : 'text-[#0A2463]'}`} />
                                                        <span className={plan.highlight ? 'text-white/80 font-light' : 'text-[#5A6482] font-light'}>{f}</span>
                                                    </li>
                                                ))}
                                                {plan.missing.map((f) => (
                                                    <li key={f} className="flex items-start gap-2.5 text-sm opacity-40">
                                                        <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-center text-xs">—</span>
                                                        <span className={plan.highlight ? 'text-white/50 font-light' : 'text-gray-400 font-light'}>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <Link
                                            to={ctaLink}
                                            className={`block w-full text-center py-4 rounded-xl font-black text-sm transition-all duration-300 ${
                                                plan.highlight 
                                                    ? 'bg-gradient-to-r from-[#F5C518] to-[#D4A800] text-[#0A2463] shadow-md hover:scale-104 active:scale-95 shadow-[#F5C518]/10 hover:shadow-[#F5C518]/25' 
                                                    : 'bg-[#0A2463] text-white hover:bg-[#071A4A] hover:scale-104 active:scale-95'
                                            }`}
                                        >
                                            {plan.cta}
                                        </Link>
                                    </div>
                                </ScrollReveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Credit usage table */}
            <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <ScrollReveal className="text-center mb-16" delay={100} type="slide" direction="up">
                        <h2 className="font-heading text-4xl text-[#0A2463] font-black tracking-tight">CREDIT <span className="text-gradient-gold">LÀ GÌ?</span></h2>
                        <p className="text-[#5A6482] font-light mt-1">Mỗi hành động tiêu tốn một số credit nhất định</p>
                    </ScrollReveal>

                    <ScrollReveal delay={250} type="scale">
                        <div className="rounded-[24px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-gray-200/60 transition-all duration-500 bg-white/70 backdrop-blur-md">
                            <div className="bg-[#0A2463] px-6 py-4.5 grid grid-cols-2 text-sm font-bold text-white uppercase tracking-wider">
                                <span>Hành động</span>
                                <span className="text-right text-[#F5C518]">Credits</span>
                            </div>
                            {creditUsage.map(({ action, credits }, i) => (
                                <div key={action} className={`px-6 py-4.5 grid grid-cols-2 text-sm border-b border-gray-50 last:border-0 ${i % 2 === 0 ? 'bg-[#F4F6FB]/40' : 'bg-white'}`}>
                                    <span className="text-gray-700 font-light">{action}</span>
                                    <span className="text-right font-bold text-[#0A2463]">{credits === 0 ? 'Miễn phí' : `${credits.toLocaleString('vi-VN')} credits`}</span>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* FAQ CTA Section */}
            <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal delay={100} type="scale" direction="up">
                        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0A2463] via-[#09205A] to-[#051336] p-10 sm:p-16 lg:p-20 text-center shadow-2xl border border-white/10">
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
                                        className="inline-flex items-center justify-center gap-2.5 px-9 py-4 border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 text-white rounded-xl text-base font-bold hover:scale-104 active:scale-95 transition-all duration-300"
                                    >
                                        Về chúng tôi
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        className="inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-gradient-to-r from-[#F5C518] to-[#D4A800] text-[#0A2463] rounded-xl text-base font-black shadow-lg shadow-[#F5C518]/15 hover:shadow-[#F5C518]/30 hover:scale-104 active:scale-95 transition-all duration-300 cursor-pointer"
                                    >
                                        Dùng thử miễn phí
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <Footer />
        </div>
    );
}

