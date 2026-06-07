import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { ScrollReveal } from '../components/ui/ScrollAnimations';
import { siteImages } from '../config/siteImages';

export default function Terms() {
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
                            ĐIỀU KHOẢN <span className="text-gradient-gold">DỊCH VỤ</span>
                        </h1>
                        <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
                            Cập nhật mới nhất: Ngày 08 tháng 06 năm 2026. Vui lòng đọc kỹ trước khi sử dụng hệ thống.
                        </p>
                    </ScrollReveal>

                    <ScrollReveal delay={150} type="scale" className="border border-white/10 bg-white/5 backdrop-blur-md p-8 sm:p-12 rounded-3xl space-y-8 text-white/80 font-light text-sm sm:text-base leading-relaxed">
                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">1. Chấp thuận điều khoản</h2>
                            <p>
                                Bằng cách đăng ký tài khoản hoặc sử dụng dịch vụ của JobReady, bạn đồng ý tuân thủ và chịu sự ràng buộc bởi các Điều khoản dịch vụ này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không truy cập hoặc sử dụng dịch vụ.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">2. Tài khoản người dùng</h2>
                            <p>
                                Bạn có trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của bạn. Bạn phải cung cấp thông tin chính xác, đầy đủ và cập nhật khi đăng ký tài khoản (bao gồm cả email chính thức để phục vụ xác thực OTP).
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">3. Sử dụng dịch vụ phỏng vấn AI và CV Gate</h2>
                            <p>
                                Dịch vụ của chúng tôi cung cấp các phân tích tự động dựa trên trí tuệ nhân tạo và thuật toán xử lý dữ liệu lớn. Kết quả phỏng vấn thử và phân tích CV chỉ mang tính chất tham khảo, giúp nâng cao kỹ năng của ứng viên và không đảm bảo việc tuyển dụng thành công.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">4. Quyền sở hữu trí tuệ</h2>
                            <p>
                                Toàn bộ nội dung, giao diện, logo, mã nguồn và hệ thống AI được phát triển bởi JobReady đều thuộc quyền sở hữu trí tuệ độc quyền của JobReady. Người dùng không được sao chép, phân phối hoặc sửa đổi trái phép bất kỳ tài sản nào của hệ thống.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">5. Thay đổi dịch vụ và điều khoản</h2>
                            <p>
                                JobReady có quyền cập nhật, chỉnh sửa hoặc ngừng cung cấp một phần hay toàn bộ dịch vụ bất cứ lúc nào mà không cần báo trước. Các thay đổi về điều khoản sẽ có hiệu lực ngay khi được đăng tải lên trang web này.
                            </p>
                        </section>
                    </ScrollReveal>
                </div>
            </div>
            <Footer theme="dark" />
        </div>
    );
}
