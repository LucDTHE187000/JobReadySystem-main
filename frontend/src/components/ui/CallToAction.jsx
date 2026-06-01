import { ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CallToAction() {
    return (
        <section className="py-16 lg:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-navy p-8 sm:p-12 lg:p-16 text-center">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative">
                        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-4 leading-tight">
                            SẴN SÀNG BẮT ĐẦU
                            <br />
                            <span className="text-gold">HÀNH TRÌNH MỚI?</span>
                        </h2>
                        <p className="text-white/60 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
                            Tham gia cộng đồng JobReady — luyện phỏng vấn AI, phân tích CV và kết nối với nhà tuyển dụng hàng đầu.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 btn-gold rounded-xl text-base font-bold">
                                Đăng ký miễn phí
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/pricing" className="inline-flex items-center justify-center gap-2 px-8 py-4 btn-outline-gold rounded-xl text-base">
                                <FileText className="w-5 h-5" />
                                Xem bảng giá
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
