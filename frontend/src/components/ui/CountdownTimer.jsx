import { useState, useEffect } from 'react';
import { Calendar, Bell } from 'lucide-react';
import { ScrollReveal } from './ScrollAnimations';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Để giữ tính nhất quán khi tải lại trang, lưu thời điểm đích vào localStorage
    const STORAGE_KEY = 'jobready_workshop_countdown_target';
    let targetTime = localStorage.getItem(STORAGE_KEY);
    let targetTimestamp = targetTime ? parseInt(targetTime, 10) : 0;

    // Nếu chưa có mốc thời gian hoặc mốc thời gian đã trôi qua, đặt lại là 3 ngày từ hiện tại
    if (!targetTimestamp || isNaN(targetTimestamp) || targetTimestamp <= Date.now()) {
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
      targetTimestamp = Date.now() + threeDaysInMs;
      localStorage.setItem(STORAGE_KEY, targetTimestamp.toString());
    }

    const calculateTime = () => {
      const difference = targetTimestamp - Date.now();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return true;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
      return false;
    };

    // Chạy lần đầu tiên
    calculateTime();

    // Thiết lập interval chạy mỗi giây
    const timer = setInterval(() => {
      const expired = calculateTime();
      if (expired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  return (
    <section className="py-12 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={100} type="scale" direction="up">
          <div className="relative overflow-hidden rounded-[32px] bg-white/5 backdrop-blur-md p-8 md:p-12 text-center shadow-2xl border border-white/10">
            {/* Decorative background blobs */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#F5C518]/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#1A3A7C]/30 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              {/* Badge */}
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#F5C518]/15 text-[#F5C518] border border-[#F5C518]/25 text-xs font-black rounded-full mb-6 uppercase tracking-widest animate-pulse">
                <Calendar size={12} />
                Sự kiện Workshop Truyền thông
              </span>

              {/* Header */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white mb-3 font-black tracking-tight leading-tight">
                ĐẾM NGƯỢC DIỄN RA <span className="text-gradient-gold"> WORKSHOP</span>
              </h2>
              <p className="text-white/60 text-xs sm:text-sm max-w-xl mx-auto mb-8 font-medium font-sans leading-relaxed">
                Đăng ký tài khoản và tham gia trực tiếp tại buổi truyền thông để nhận ngay quà tặng credit miễn phí trải nghiệm chấm CV và phỏng vấn thử AI.
              </p>

              {/* Countdown Numbers Grid */}
              <div className="grid grid-cols-4 gap-2 sm:gap-6 max-w-2xl mx-auto mb-8">
                {[
                  { value: timeLeft.days, label: 'Ngày' },
                  { value: timeLeft.hours, label: 'Giờ' },
                  { value: timeLeft.minutes, label: 'Phút' },
                  { value: timeLeft.seconds, label: 'Giây' },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-5 flex flex-col justify-center items-center backdrop-blur-sm relative group hover:bg-white/10 transition-all duration-300"
                  >
                    <span className="text-3xl sm:text-5xl font-black text-[#F5C518] tracking-tight font-mono">
                      {formatNumber(item.value)}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-wider mt-2">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Banner Info */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs sm:text-sm font-semibold text-white/80 max-w-xl mx-auto shadow-inner">
                <Bell size={14} className="text-[#F5C518] animate-bounce" />
                <span>
                  {isExpired 
                    ? 'Sự kiện đang diễn ra! Hãy tham gia ngay.' 
                    : 'Tham Gia Workshop để nhận mã ưu đãi độc quyền từ JobReady.'}
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
