import { useState } from 'react';
import axios from 'axios';
import SeekerLayout from '../components/layout/SeekerLayout';

export default function Feedback() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const [type, setType] = useState('Bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('submitting');

    if (!subject.trim() || !message.trim()) {
      setError('Vui lòng điền đầy đủ tiêu đề và nội dung phản hồi.');
      setStatus('idle');
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      await axios.post(
        `${API_URL}/api/feedback`,
        { type, subject, message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatus('success');
      setSubject('');
      setMessage('');
      setType('Bug');
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md p-8 shadow-xl text-white">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.3em] text-white/40 mb-2">Feedback</p>
            <h2 className="text-3xl font-bold text-white">Chia sẻ trải nghiệm của bạn</h2>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              Chọn loại phản hồi để gửi bug, góp ý hoặc đánh giá. Chúng tôi sẽ lưu lại và cải thiện dịch vụ ngay.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {['Bug', 'Góp ý', 'Đánh giá'].map((option) => (
                <label
                  key={option}
                  className={`cursor-pointer rounded-3xl border p-4 text-center transition-colors ${
                    type === option
                      ? 'border-[#F5C518] bg-white/25 text-[#F5C518] shadow-sm'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-[#F5C518] hover:bg-white/15'
                  }`}
                >
                  <input
                    type="radio"
                    name="feedbackType"
                    value={option}
                    checked={type === option}
                    onChange={() => setType(option)}
                    className="hidden"
                  />
                  <span className="block text-base font-semibold">{option}</span>
                </label>
              ))}
            </div>

            <div className="grid gap-6">
              <label className="block">
                <span className="text-sm font-medium text-white">Tiêu đề phản hồi</span>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ví dụ: Lỗi đăng nhập hoặc UX chưa rõ"
                  className="mt-3 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-white">Nội dung chi tiết</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  placeholder="Mô tả vấn đề, gợi ý cải thiện hoặc trải nghiệm của bạn..."
                  className="mt-3 w-full resize-none rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white outline-none transition focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/20"
                />
              </label>
            </div>

            {error && (
              <div className="rounded-3xl border border-red-100 bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300 backdrop-blur-md">
                {error}
              </div>
            )}

            {status === 'success' && (
              <div className="rounded-3xl border border-emerald-100 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300 backdrop-blur-md">
                Cảm ơn bạn! Phản hồi đã được gửi thành công.
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-white/70">
                Chúng tôi trân trọng mọi bug, góp ý và đánh giá để hoàn thiện trải nghiệm của bạn.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-[#F5C518] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#D4A800] disabled:cursor-not-allowed disabled:opacity-70"
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
