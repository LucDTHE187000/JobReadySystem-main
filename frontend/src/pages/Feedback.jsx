import { API_URL } from '@/config';
import { useState } from 'react';
import axios from 'axios';
import SeekerLayout from '../components/layout/SeekerLayout';
import { Star, Check, AlertCircle } from 'lucide-react';

const BUG_OPTIONS = [
  "Lỗi đăng nhập / Đăng ký",
  "Lỗi tải lên hoặc phân tích CV",
  "Giao diện hiển thị sai lệch",
  "Luyện tập phỏng vấn AI bị lỗi",
  "Lỗi nạp hoặc trừ credit"
];

const SUGGESTION_OPTIONS = [
  "Thêm nhiều tính năng luyện phỏng vấn",
  "Cải thiện giao diện trực quan hơn",
  "Tăng tốc độ phản hồi của AI",
  "Bổ sung mẫu CV thiết kế đẹp hơn",
  "Cung cấp thêm nhiều tài liệu học tập"
];

export default function Feedback() {
  const [type, setType] = useState('Bug');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleTypeChange = (newType) => {
    setType(newType);
    setSelectedOptions([]);
    setRating(5);
    setMessage('');
    setError('');
  };

  const handleCheckboxChange = (opt) => {
    setSelectedOptions((prev) =>
      prev.includes(opt) ? prev.filter((item) => item !== opt) : [...prev, opt]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('submitting');

    let finalSubject = '';
    if (type === 'Bug') {
      if (selectedOptions.length === 0 && !message.trim()) {
        setError('Vui lòng chọn ít nhất một lỗi thường gặp hoặc viết ý kiến riêng.');
        setStatus('idle');
        return;
      }
      finalSubject = `Báo lỗi: ${selectedOptions.join(', ') || 'Ý kiến riêng'}`;
    } else if (type === 'Góp ý') {
      if (selectedOptions.length === 0 && !message.trim()) {
        setError('Vui lòng chọn ít nhất một góp ý hoặc viết ý kiến riêng.');
        setStatus('idle');
        return;
      }
      finalSubject = `Góp ý: ${selectedOptions.join(', ') || 'Ý kiến riêng'}`;
    } else if (type === 'Đánh giá') {
      if (!message.trim()) {
        setError('Vui lòng nhập nội dung đánh giá chi tiết trải nghiệm của bạn.');
        setStatus('idle');
        return;
      }
      finalSubject = `Đánh giá: ${rating} sao`;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      await axios.post(
        `${API_URL}/api/feedback`,
        { 
          type, 
          subject: finalSubject, 
          message: message.trim() || '(Không viết gì thêm)',
          rating: type === 'Đánh giá' ? rating : undefined,
          checkedOptions: type !== 'Đánh giá' ? selectedOptions : undefined
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatus('success');
      setMessage('');
      setSelectedOptions([]);
      setRating(5);
    } catch (submitError) {
      console.error('Send feedback failed:', submitError);
      setError(submitError.response?.data?.message || 'Không thể gửi phản hồi. Vui lòng thử lại sau.');
      setStatus('error');
    }
  };

  return (
    <SeekerLayout
      title="Feedback"
      breadcrumb="Gửi phản hồi hoặc đánh giá trải nghiệm sau khi sử dụng JobReady"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-md p-8 shadow-md text-slate-800">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-2">Feedback</p>
            <h2 className="text-3xl font-bold text-slate-800">Chia sẻ trải nghiệm của bạn</h2>
            <p className="mt-3 text-sm text-slate-650 leading-relaxed font-medium">
              Chọn loại phản hồi để gửi báo lỗi, góp ý phát triển hoặc đánh giá dịch vụ. Chúng tôi trân trọng mọi ý kiến từ bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tabs selection */}
            <div className="grid gap-4 sm:grid-cols-3">
              {['Bug', 'Góp ý', 'Đánh giá'].map((option) => (
                <label
                  key={option}
                  className={`cursor-pointer rounded-3xl border p-4 text-center transition-all duration-200 select-none ${
                    type === option
                      ? 'border-[#F5C518] bg-white/30 text-[#F5C518] shadow-sm font-bold scale-[1.02]'
                      : 'border-slate-250 bg-white/50 text-slate-600 hover:border-[#F5C518]/60 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="feedbackType"
                    value={option}
                    checked={type === option}
                    onChange={() => handleTypeChange(option)}
                    className="hidden"
                  />
                  <span className="block text-base font-semibold">{option}</span>
                </label>
              ))}
            </div>

            {/* Sub-form fields according to type */}
            <div className="grid gap-6">
              {type === 'Bug' && (
                <div>
                  <span className="text-sm font-bold text-slate-700 block mb-3">Lỗi bạn thường gặp (tích chọn):</span>
                  <div className="space-y-2.5">
                    {BUG_OPTIONS.map((opt) => {
                      const isSelected = selectedOptions.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleCheckboxChange(opt)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-200 select-none cursor-pointer ${
                            isSelected
                              ? 'border-[#F5C518] bg-[#F5C518]/5 text-[#0A2463] font-semibold shadow-sm'
                              : 'border-slate-200 bg-white/70 text-slate-700 hover:border-[#F5C518]/40 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-sm font-medium">{opt}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-150 ${
                            isSelected ? 'border-[#F5C518] bg-[#F5C518] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {type === 'Góp ý' && (
                <div>
                  <span className="text-sm font-bold text-slate-700 block mb-3">Nội dung muốn góp ý (tích chọn):</span>
                  <div className="space-y-2.5">
                    {SUGGESTION_OPTIONS.map((opt) => {
                      const isSelected = selectedOptions.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleCheckboxChange(opt)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-200 select-none cursor-pointer ${
                            isSelected
                              ? 'border-[#F5C518] bg-[#F5C518]/5 text-[#0A2463] font-semibold shadow-sm'
                              : 'border-slate-200 bg-white/70 text-slate-700 hover:border-[#F5C518]/40 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-sm font-medium">{opt}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-150 ${
                            isSelected ? 'border-[#F5C518] bg-[#F5C518] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {type === 'Đánh giá' && (
                <div>
                  <span className="text-sm font-bold text-slate-700 block mb-2">Đánh giá sao trải nghiệm của bạn:</span>
                  <div className="flex items-center gap-1.5 mt-1.5 bg-slate-50/50 p-4 border border-slate-200/50 rounded-2xl w-fit">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= (hoverRating || rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-125 focus:outline-none"
                        >
                          <Star
                            className={`w-9 h-9 transition-colors ${
                              isFilled ? 'fill-[#F5C518] text-[#F5C518]' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-4 text-sm font-bold text-slate-650 min-w-[150px]">
                      {rating} / 5 sao ({rating === 5 ? 'Tuyệt vời!' : rating === 4 ? 'Rất tốt' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Tệ' : 'Rất tệ'})
                    </span>
                  </div>
                </div>
              )}

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  {type === 'Đánh giá' ? 'Nội dung đánh giá chi tiết' : 'Ý kiến riêng của bạn / Mô tả thêm'}
                </span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder={
                    type === 'Bug'
                      ? "Mô tả chi tiết lỗi bạn gặp phải, các bước dẫn đến lỗi..."
                      : type === 'Góp ý'
                      ? "Mô tả chi tiết ý tưởng hoặc cách thức bạn muốn chúng tôi cải thiện..."
                      : "Hãy chia sẻ cảm nghĩ của bạn về dịch vụ..."
                  }
                  className="mt-3 w-full resize-none rounded-3xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-800 outline-none transition focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/20"
                />
              </label>
            </div>

            {error && (
              <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {status === 'success' && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
                Cảm ơn bạn! Phản hồi đã được gửi thành công. Hệ thống đã gửi mail xác nhận đến bạn.
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              <p className="text-sm text-slate-500 font-medium">
                Chúng tôi trân trọng mọi ý kiến đóng góp của bạn để ngày càng hoàn thiện dịch vụ.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-[#F5C518] px-7 py-3 text-sm font-bold text-[#0A2463] transition hover:bg-[#D4A800] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer shadow-md"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Đang gửi...' : 'Gửi feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SeekerLayout>
  );
}
