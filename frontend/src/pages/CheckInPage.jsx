import { API_URL } from '@/config';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import SeekerLayout from '../components/layout/SeekerLayout';
import { CheckCircle, Calendar } from 'lucide-react';

export default function CheckInPage() {
  const { user, refreshUser } = useAuth();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState('');
  const [checkInError, setCheckInError] = useState('');

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    setCheckInSuccess('');
    setCheckInError('');
    try {
      const response = await axios.post(
        `${API_URL}/api/payment/checkin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCheckInSuccess(response.data.message || 'Điểm danh thành công! Bạn nhận được +3 credits.');
      if (refreshUser) await refreshUser();
    } catch (error) {
      console.error("Check-in error:", error);
      setCheckInError(error.response?.data?.message || 'Điểm danh thất bại. Vui lòng thử lại sau.');
    } finally {
      setCheckInLoading(false);
    }
  };

  const hasCheckedInToday = () => {
    if (!user || !user.lastCheckIn) return false;
    const lastCheckInDate = new Date(user.lastCheckIn);
    const today = new Date();
    return (
      lastCheckInDate.getDate() === today.getDate() &&
      lastCheckInDate.getMonth() === today.getMonth() &&
      lastCheckInDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <SeekerLayout title="Điểm danh nhận quà" breadcrumb="Ví Credit › Điểm danh">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[32px] bg-white/80 border border-slate-200/60 backdrop-blur-md p-10 text-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#F5C518]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#0A2463]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-tr from-[#F5C518] to-amber-400 text-[#0A2463] rounded-full flex items-center justify-center text-4xl shadow-md animate-bounce">
              📅
            </div>

            <h2 className="text-3xl font-black text-[#0A2463] mb-4">Điểm danh tích lũy hàng ngày</h2>
            <p className="text-slate-650 mb-8 max-w-md mx-auto leading-relaxed font-medium">
              Mỗi ngày đăng nhập và điểm danh, bạn sẽ được hệ thống tặng ngay <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">+3 credits</span> hoàn toàn miễn phí để phục vụ chấm CV và phỏng vấn AI.
            </p>

            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 mb-8 max-w-sm mx-auto">
              <p className="text-xs uppercase tracking-wider text-slate-450 font-bold mb-1">Số dư hiện tại của bạn</p>
              <p className="text-3xl font-black text-[#0A2463]">{(user?.credits ?? 0).toLocaleString('vi-VN')} credits</p>
              {user?.lastCheckIn && (
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  Lần điểm danh cuối: {new Date(user.lastCheckIn).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>

            {hasCheckedInToday() ? (
              <div className="space-y-4">
                <button
                  type="button"
                  disabled
                  className="w-full max-w-sm mx-auto rounded-2xl bg-slate-100 border border-slate-200 text-slate-455 py-4 text-base font-bold flex items-center justify-center gap-2 cursor-not-allowed shadow-inner"
                >
                  <CheckCircle className="h-5 w-5 text-emerald-500" /> Hôm nay bạn đã nhận thưởng
                </button>
                <p className="text-xs text-slate-450 italic font-medium">Hẹn gặp lại bạn vào ngày mai để tiếp tục nhận quà nhé!</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={checkInLoading}
                className="w-full max-w-sm mx-auto rounded-2xl bg-gradient-to-r from-[#F5C518] to-[#D4A800] text-[#0A2463] hover:scale-[1.03] active:scale-[0.97] py-4 text-base font-black transition-all shadow-lg shadow-[#F5C518]/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {checkInLoading ? 'Đang điểm danh...' : 'Điểm danh ngay (+3 Credits)'}
              </button>
            )}

            {checkInSuccess && (
              <div className="mt-6 max-w-sm mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3.5 text-sm text-emerald-700 shadow-md font-bold animate-fade-in">
                ✓ {checkInSuccess}
              </div>
            )}

            {checkInError && (
              <div className="mt-6 max-w-sm mx-auto rounded-2xl bg-red-50 border border-red-200 px-5 py-3.5 text-sm text-red-750 shadow-md font-semibold animate-fade-in">
                ⚠ {checkInError}
              </div>
            )}
          </div>
        </div>
      </div>
    </SeekerLayout>
  );
}
