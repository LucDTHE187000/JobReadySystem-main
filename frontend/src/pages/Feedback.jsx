import { API_URL } from '@/config';
import { useState } from 'react';
import axios from 'axios';
import SeekerLayout from '../components/layout/SeekerLayout';

export default function Feedback() {

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
        <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-md p-8 shadow-md text-slate-800">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-2">Feedback</p>
            <h2 className="text-3xl font-bold text-slate-800">Chia sẻ trải nghiệm của bạn</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
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
                      : 'border-slate-300 bg-white text-slate-600 hover:border-[#F5C518] hover:bg-white/15'
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
                <span className="text-sm font-medium text-slate-700 font-semibold">Tiêu đề phản hồi</span>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ví dụ: Lỗi đăng nhập hoặc UX chưa rõ"
                  className="mt-3 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 font-semibold">Nội dung chi tiết</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  placeholder="Mô tả vấn đề, gợi ý cải thiện hoặc trải nghiệm của bạn..."
                  className="mt-3 w-full resize-none rounded-3xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-800 outline-none transition focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/20"
                />
              </label>
            </div>

            {error && (
              <div className="rounded-3xl border border-red-100 bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 shadow-sm">
                {error}
              </div>
            )}

            {status === 'success' && (
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 shadow-sm">
                Cảm ơn bạn! Phản hồi đã được gửi thành công.
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-slate-600">
                Chúng tôi trân trọng mọi bug, góp ý và đánh giá để hoàn thiện trải nghiệm của bạn.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-[#F5C518] px-7 py-3 text-sm font-bold text-[#0A2463] transition hover:bg-[#D4A800] disabled:cursor-not-allowed disabled:opacity-70"
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
