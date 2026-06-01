import { useState } from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { siteImages } from '../config/siteImages';
import { Check, Zap, Crown, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero */}
            <section className="relative bg-navy overflow-hidden">
                <div className="absolute inset-0">
                    <img src={siteImages.pricingHero} alt="" className="w-full h-full object-cover opacity-10" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
                    <span className="inline-block px-4 py-1.5 bg-gold/15 text-gold text-sm font-bold rounded-full mb-6 uppercase tracking-wide">Bảng giá</span>
                    <h1 className="font-heading text-[clamp(3rem,7vw,5rem)] leading-[0.95] text-white mb-6 animate-fade-up">
                        CHỌN GÓI
                        <br />
                        <span className="text-gold">PHÙ HỢP VỚI BẠN</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
                        Hệ thống credit linh hoạt — trả cho những gì bạn thực sự sử dụng. Không ràng buộc, hủy bất cứ lúc nào.
                    </p>

                    {/* Billing toggle */}
                    <div className="inline-flex items-center gap-3 bg-white/10 rounded-xl p-1.5">
                        <button
                            onClick={() => setBilling('monthly')}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billing === 'monthly' ? 'bg-gold text-navy' : 'text-white/70 hover:text-white'}`}
                        >
                            Hàng tháng
                        </button>
                        <button
                            onClick={() => setBilling('yearly')}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-gold text-navy' : 'text-white/70 hover:text-white'}`}
                        >
                            Hàng năm
                            <span className="text-xs bg-navy/20 px-2 py-0.5 rounded-full">-20%</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Pricing cards */}
            <section className="py-16 lg:py-20 bg-[var(--surface)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        {plans.map((plan) => {
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
                                <div
                                    key={plan.id}
                                    className={`relative rounded-2xl p-8 card-hover ${
                                        plan.highlight
                                            ? 'bg-navy text-white border-2 border-gold shadow-2xl scale-[1.02]'
                                            : 'bg-white border border-gray-100'
                                    }`}
                                >
                                    {plan.highlight && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-navy text-xs font-bold rounded-full uppercase tracking-wide">
                                            Phổ biến nhất
                                        </div>
                                    )}

                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${plan.highlight ? 'bg-gold' : 'bg-navy'}`}>
                                        <Icon className={`w-6 h-6 ${plan.highlight ? 'text-navy' : 'text-gold'}`} />
                                    </div>

                                    <h3 className={`font-heading text-3xl mb-1 ${plan.highlight ? 'text-white' : 'text-navy'}`}>{plan.name}</h3>
                                    <p className={`text-sm mb-6 ${plan.highlight ? 'text-white/60' : 'text-gray-500'}`}>{plan.desc}</p>

                                    <div className="mb-2">
                                        {plan.price === 'Liên hệ' ? (
                                            <span className={`font-heading text-4xl ${plan.highlight ? 'text-gold' : 'text-navy'}`}>Liên hệ</span>
                                        ) : (
                                            <>
                                                <span className={`font-heading text-5xl ${plan.highlight ? 'text-gold' : 'text-navy'}`}>{displayPrice}</span>
                                                {plan.price !== '0' && <span className={`text-sm ml-1 ${plan.highlight ? 'text-white/60' : 'text-gray-500'}`}>đ{plan.period}</span>}
                                            </>
                                        )}
                                    </div>
                                    <p className={`text-xs font-semibold mb-6 ${plan.highlight ? 'text-gold' : 'text-gold-dark'}`}>{plan.credits}</p>

                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-start gap-2.5 text-sm">
                                                <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-gold' : 'text-navy'}`} />
                                                <span className={plan.highlight ? 'text-white/80' : 'text-gray-600'}>{f}</span>
                                            </li>
                                        ))}
                                        {plan.missing.map((f) => (
                                            <li key={f} className="flex items-start gap-2.5 text-sm opacity-40">
                                                <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-center">—</span>
                                                <span className={plan.highlight ? 'text-white/50' : 'text-gray-400'}>{f}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        to={ctaLink}
                                        className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all ${
                                            plan.highlight ? 'btn-gold' : 'btn-navy text-white'
                                        }`}
                                    >
                                        {plan.cta}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Credit usage table */}
            <section className="py-16 lg:py-20 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="font-heading text-4xl text-navy mb-3">CREDIT <span className="text-gold">LÀ GÌ?</span></h2>
                        <p className="text-gray-500">Mỗi hành động tiêu tốn một số credit nhất định</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="bg-navy px-6 py-4 grid grid-cols-2 text-sm font-semibold text-white">
                            <span>Hành động</span>
                            <span className="text-right text-gold">Credits</span>
                        </div>
                        {creditUsage.map(({ action, credits }, i) => (
                            <div key={action} className={`px-6 py-4 grid grid-cols-2 text-sm ${i % 2 === 0 ? 'bg-[var(--surface)]' : 'bg-white'}`}>
                                <span className="text-gray-700">{action}</span>
                                <span className="text-right font-bold text-navy">{credits} credits</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ CTA */}
            <section className="py-16 bg-navy">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="font-heading text-4xl text-white mb-4">CÒN THẮC MẮC?</h2>
                    <p className="text-white/60 mb-8">Liên hệ team JobReady — chúng tôi phản hồi trong vòng 24 giờ.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/about" className="inline-flex items-center gap-2 px-8 py-4 btn-outline-gold rounded-xl font-semibold">
                            Về chúng tôi
                        </Link>
                        <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 btn-gold rounded-xl font-bold">
                            Dùng thử miễn phí <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
