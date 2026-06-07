import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { ScrollReveal } from '../components/ui/ScrollAnimations';
import { siteImages } from '../config/siteImages';

export default function Privacy() {
    return (
        <div 
            className="min-h-screen text-white font-sans relative overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed flex flex-col justify-between"
            style={{ backgroundImage: `url(${siteImages.guestBg})` }}
        >
            {/* Premium backdrop-blur and dark-gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#030a21]/85 via-[#051336]/80 to-[#030a21]/90 backdrop-blur-[3px] pointer-events-none" />

            <div>
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
                    <ScrollReveal className="text-center mb-16" delay={100} type="slide" direction="up">
                        <h1 className="font-heading text-4xl sm:text-5xl text-white mb-4 font-black tracking-tight">
                            CHÍNH SÁCH <span className="text-gradient-gold">BẢO MẬT</span>
                        </h1>
                        <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
                            Bảo vệ quyền riêng tư và thông tin cá nhân của bạn là ưu tiên hàng đầu của chúng tôi.
                        </p>
                    </ScrollReveal>

                    <ScrollReveal delay={150} type="scale" className="border border-white/10 bg-white/5 backdrop-blur-md p-8 sm:p-12 rounded-3xl space-y-8 text-white/80 font-light text-sm sm:text-base leading-relaxed">
                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">1. Thu thập thông tin cá nhân</h2>
                            <p>
                                Chúng tôi thu thập thông tin khi bạn đăng ký tài khoản, tải lên hồ sơ CV hoặc tham gia các phiên phỏng vấn thử AI. Thông tin này bao gồm: Họ tên, địa chỉ email, số điện thoại, lịch sử học tập, kinh nghiệm làm việc và các dữ liệu phản hồi câu hỏi.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">2. Sử dụng thông tin</h2>
                            <p>
                                Thông tin thu thập được sử dụng để:
                            </p>
                            <ul className="list-disc pl-6 space-y-1.5">
                                <li>Vận hành, cải thiện và tối ưu hóa hệ thống AI chấm điểm CV và hỏi đáp.</li>
                                <li>Gửi mã xác thực OTP qua email để bảo mật tài khoản.</li>
                                <li>Kết nối ứng viên phù hợp với các nhà tuyển dụng đối tác.</li>
                                <li>Hỗ trợ khách hàng và giải quyết các thắc mắc.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">3. Bảo mật thông tin</h2>
                            <p>
                                Chúng tôi áp dụng các biện pháp bảo mật mã hóa tiên tiến để ngăn ngừa việc truy cập, thay đổi hoặc tiết lộ trái phép thông tin cá nhân của người dùng. Dữ liệu của bạn được lưu trữ an toàn trong các hệ thống đám mây tiêu chuẩn quốc tế.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">4. Chia sẻ thông tin với bên thứ ba</h2>
                            <p>
                                Chúng tôi chỉ chia sẻ hồ sơ ứng viên (CV, kết quả phỏng vấn AI) với nhà tuyển dụng khi được sự đồng ý của chính bạn thông qua hoạt động nộp hồ sơ ứng tuyển. Chúng tôi tuyệt đối không bán thông tin cá nhân của bạn cho bất kỳ đơn vị quảng cáo nào.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">5. Quyền kiểm soát của người dùng</h2>
                            <p>
                                Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa bỏ vĩnh viễn tài khoản cùng toàn bộ thông tin cá nhân lưu giữ trên hệ thống bất cứ lúc nào thông qua phần Cài đặt tài khoản hoặc liên hệ trực tiếp với chúng tôi qua email hỗ trợ.
                            </p>
                        </section>
                    </ScrollReveal>
                </div>
            </div>
            <Footer theme="dark" />
        </div>
    );
}
