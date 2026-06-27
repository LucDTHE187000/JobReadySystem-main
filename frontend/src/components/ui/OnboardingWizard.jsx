import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Brain,
  TrendingUp,
  Briefcase,
  Gift,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function OnboardingWizard({ role = 'seeker', isOpen, onClose }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!!isOpen);
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!visible) return null;

  const seekerSteps = [
    {
      title: "Chào mừng bạn đến với JobReady! 🎉",
      description: "Nền tảng hỗ trợ phát triển sự nghiệp toàn diện bằng trí tuệ nhân tạo (AI). Chúng tôi đã chuẩn bị sẵn Credits miễn phí trong tài khoản để bạn có thể bắt đầu trải nghiệm ngay tức thì!",
      icon: <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse" />,
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      linkText: "Khám phá ngay",
      action: () => setCurrentStep(1)
    },
    {
      title: "Chấm điểm & Tối ưu hóa CV 📄",
      description: "Tải CV của bạn lên để AI tự động phân tích điểm ATS, đánh giá điểm mạnh/điểm yếu chuyên môn, lọc ra danh sách kỹ năng nổi bật và gợi ý cải thiện để tăng 85% cơ hội được gọi phỏng vấn.",
      icon: <FileText className="w-12 h-12 text-blue-400" />,
      gradient: "from-blue-500 to-indigo-500",
      linkText: "Tới trang Chấm CV",
      action: () => {
        handleClose(true);
        navigate('/cv-upload');
      }
    },
    {
      title: "Luyện phỏng vấn giả lập AI 🤖",
      description: "Trải nghiệm phòng phỏng vấn giả lập thực tế 1-1 với AI. AI sẽ tự động sinh câu hỏi theo sát chuyên môn và CV của bạn. Bạn có thể trả lời bằng giọng nói thông qua Microphone hoặc gõ văn bản.",
      icon: <Brain className="w-12 h-12 text-purple-400" />,
      gradient: "from-purple-500 to-pink-500",
      linkText: "Vào phòng phỏng vấn",
      action: () => {
        handleClose(true);
        navigate('/interview');
      }
    },
    {
      title: "Đo lường & Theo dõi tiến trình 📈",
      description: "Theo dõi kết quả đánh giá phỏng vấn từ AI. Nhận phân tích chi tiết về mức độ tiến bộ, điểm mạnh, điểm cần cải thiện và biểu đồ thay đổi điểm số qua từng buổi phỏng vấn.",
      icon: <TrendingUp className="w-12 h-12 text-emerald-400" />,
      gradient: "from-emerald-500 to-teal-500",
      linkText: "Xem Phân tích tiến trình",
      action: () => {
        handleClose(true);
        navigate('/interview-analytics');
      }
    },
    {
      title: "Tìm việc làm & Ứng tuyển nhanh 💼",
      description: "Khám phá hàng ngàn cơ hội việc làm từ các doanh nghiệp uy tín. Nộp CV trực tuyến và theo dõi trạng thái ứng tuyển của mình một cách minh bạch ngay trên hệ thống.",
      icon: <Briefcase className="w-12 h-12 text-amber-400" />,
      gradient: "from-amber-500 to-orange-500",
      linkText: "Tìm việc làm ngay",
      action: () => {
        handleClose(true);
        navigate('/jobs');
      }
    }
  ];

  const recruiterSteps = [
    {
      title: "Chào mừng Quý Nhà Tuyển Dụng! 🏢",
      description: "JobReady cung cấp giải pháp đăng tin tuyển dụng chuyên nghiệp, quản lý ứng viên thông minh và ứng dụng AI để sàng lọc hồ sơ chất lượng cao hiệu quả nhất.",
      icon: <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse" />,
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      linkText: "Khám phá ngay",
      action: () => setCurrentStep(1)
    },
    {
      title: "Đăng tin tuyển dụng nhanh chóng 📝",
      description: "Dễ dàng quản lý và đăng tuyển các cơ hội việc làm mới. Bạn có thể cài đặt mức lương, yêu cầu kỹ năng, mô tả công việc và các câu hỏi sàng lọc đầu vào.",
      icon: <Briefcase className="w-12 h-12 text-blue-400" />,
      gradient: "from-blue-500 to-indigo-500",
      linkText: "Đăng tin tuyển dụng",
      action: () => {
        handleClose(true);
        navigate('/job-application');
      }
    },
    {
      title: "Sàng lọc ứng viên thông minh 👥",
      description: "Theo dõi danh sách ứng viên nộp đơn ứng tuyển cho từng vị trí. AI tự động trích xuất điểm số tương thích của CV ứng viên giúp bạn ra quyết định phỏng vấn nhanh hơn.",
      icon: <Users className="w-12 h-12 text-purple-400" />,
      gradient: "from-purple-500 to-pink-500",
      linkText: "Quản lý ứng viên",
      action: () => {
        handleClose(true);
        navigate('/candidate');
      }
    },
    {
      title: "Chủ động tìm kiếm tài năng 🔍",
      description: "Sử dụng công cụ tìm kiếm ứng viên nâng cao của chúng tôi để tra cứu hàng ngàn hồ sơ ứng viên chất lượng cao có sẵn trên hệ thống theo từ khóa kỹ năng.",
      icon: <Search className="w-12 h-12 text-emerald-400" />,
      gradient: "from-emerald-500 to-teal-500",
      linkText: "Tìm kiếm ứng viên",
      action: () => {
        handleClose(true);
        navigate('/candidate-search');
      }
    },
    {
      title: "Quản lý ngân sách & Credit 💳",
      description: "Nạp credit nhanh chóng qua PayOS để sử dụng các dịch vụ tuyển dụng nâng cao, gia hạn tin đăng hoặc mua các gói đãi ngộ đặc biệt dành cho doanh nghiệp.",
      icon: <Gift className="w-12 h-12 text-amber-400" />,
      gradient: "from-amber-500 to-orange-500",
      linkText: "Xem bảng quản trị",
      action: () => {
        handleClose(true);
        navigate('/dashboard');
      }
    }
  ];

  const steps = role === 'seeker' ? seekerSteps : recruiterSteps;
  const step = steps[currentStep];

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden bg-zinc-900/90 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col max-h-[90vh]">
        
        {/* Decorative Top Gradient Line */}
        <div className={`w-full h-1.5 bg-gradient-to-r ${step.gradient} transition-all duration-500`} />

        {/* Close Button */}
        <button
          onClick={() => handleClose(false)}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Content */}
        <div className="flex-1 p-6 md:p-8 flex flex-col items-center text-center overflow-y-auto">
          {/* Animated Icon Circle */}
          <div className={`w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner relative group overflow-hidden`}>
            {/* Pulsing light background overlay */}
            <div className={`absolute inset-0 bg-gradient-to-tr ${step.gradient} opacity-10`} />
            <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
              {step.icon}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight font-sans transition-all duration-300">
            {step.title}
          </h3>

          {/* Description */}
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed mb-8 max-w-md font-sans">
            {step.description}
          </p>

          {/* Direct Link Action */}
          {currentStep > 0 && (
            <button
              onClick={step.action}
              className={`px-6 py-2.5 rounded-full bg-gradient-to-r ${step.gradient} text-white font-semibold text-sm shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transform hover:-translate-y-0.5 transition-all cursor-pointer inline-flex items-center gap-1.5 mb-6`}
            >
              <span>{step.linkText}</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-6 md:px-8 border-t border-white/5 bg-zinc-950/40 flex flex-col gap-4 flex-shrink-0">
          
          {/* Steps & Navigation Buttons */}
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1 text-sm font-medium cursor-pointer ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ChevronLeft size={16} />
              <span>Trước</span>
            </button>

            {/* Steps Dots */}
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentStep ? `w-6 bg-gradient-to-r ${step.gradient}` : 'w-2 bg-white/10 hover:bg-white/20'}`}
                />
              ))}
            </div>

            {/* Next / Complete Button */}
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-100 rounded-xl transition-all text-sm font-semibold flex items-center gap-1 cursor-pointer shadow-md"
            >
              <span>{currentStep === steps.length - 1 ? 'Hoàn thành' : 'Tiếp tục'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
