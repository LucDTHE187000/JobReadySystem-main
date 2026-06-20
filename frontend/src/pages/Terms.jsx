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
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-zinc-950/70 to-black/90 backdrop-blur-[3px] pointer-events-none" />

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
                            <h2 className="text-xl font-bold text-[#F5C518]">1. Chấp thuận điều khoản & Luật áp dụng</h2>
                            <p>
                                Bằng cách đăng ký tài khoản hoặc sử dụng dịch vụ của JobReady, bạn đồng ý tuân thủ và chịu sự ràng buộc bởi các Điều khoản dịch vụ này. Mọi hoạt động trên nền tảng được điều chỉnh, diễn giải và tuân thủ tuyệt đối theo quy định của pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam, bao gồm Luật An ninh mạng và các văn bản hướng dẫn hiện hành.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">2. Quy định dành cho Ứng viên (Job Seeker)</h2>
                            <p>
                                Ứng viên được sử dụng các công cụ tải lên, thiết kế CV, tham gia phỏng vấn thử với AI và tìm kiếm cơ hội việc làm. Bạn cam kết thông tin cung cấp trên CV, kết quả kinh nghiệm làm việc là đúng sự thật. Nghiêm cấm hành vi giả mạo người khác, đăng tải nội dung đồi trụy, xuyên tạc hoặc vi phạm pháp luật Việt Nam.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">3. Quy định dành cho Nhà tuyển dụng (Employer)</h2>
                            <p>
                                Nhà tuyển dụng đăng ký tài khoản phải trải qua quy trình kiểm duyệt thông tin doanh nghiệp thủ công từ phía Admin (bao gồm xác thực mã số thuế, kiểm tra tư cách pháp nhân thực tế). Bạn chỉ được đăng tin tuyển dụng sau khi nhận được sự phê duyệt chính thức. Nghiêm cấm đăng tin tuyển dụng lừa đảo, đa cấp bất hợp pháp, hoặc các hoạt động tìm kiếm lao động vi phạm pháp luật.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">4. Tích hợp và liên kết Bên thứ ba (TopCV, LinkedIn,...)</h2>
                            <p>
                                Nền tảng JobReady hoạt động như một kênh trung gian hỗ trợ kết nối. Một số tin tuyển dụng trên hệ thống có thể chứa các liên kết chuyển hướng ứng tuyển sang bên thứ ba (như TopCV, LinkedIn...). JobReady không sở hữu, kiểm soát hoặc chịu trách nhiệm về nội dung, chính sách bảo mật, hay tính xác thực của các bài đăng và dịch vụ từ các bên thứ ba này.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">5. Giới hạn trách nhiệm pháp lý tối đa</h2>
                            <p>
                                Trong mọi trường hợp xảy ra sai sót, tranh chấp, lừa đảo hoặc sự cố phát sinh giữa Ứng viên và Nhà tuyển dụng (hoặc với Bên thứ ba), trách nhiệm liên quan của JobReady sẽ được gạt xuống mức thấp nhất theo quy định pháp luật. JobReady từ chối mọi trách nhiệm liên đới, bồi thường thiệt hại đối với bất kỳ tổn thất tài chính, cơ hội nghề nghiệp, hoặc rủi ro pháp lý nào mà người dùng gặp phải khi tương tác trên nền tảng.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[#F5C518]">6. Quyền sở hữu trí tuệ</h2>
                            <p>
                                Toàn bộ nội dung, giao diện, logo, mã nguồn và hệ thống AI được phát triển bởi JobReady đều thuộc quyền sở hữu trí tuệ độc quyền của JobReady. Người dùng không được sao chép, phân phối hoặc sửa đổi trái phép bất kỳ tài sản nào của hệ thống.
                            </p>
                        </section>
                    </ScrollReveal>
                </div>
            </div>
            <Footer theme="dark" />
        </div>
    );
}
