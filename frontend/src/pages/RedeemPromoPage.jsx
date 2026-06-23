import { API_URL } from '@/config';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SeekerLayout from '../components/layout/SeekerLayout';
import { Award, Ticket, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';

export default function RedeemPromoPage() {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const queryParams = new URLSearchParams(location.search);

  // States
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState('');
  const [promoError, setPromoError] = useState('');

  // Event PIN verification states
  const [showPinModal, setShowPinModal] = useState(false);
  const [activePromoCode, setActivePromoCode] = useState('');
  const [pinInput, setPinInput] = useState('');

  // Auto-redeem from QR code "?promo=CODE"
  useEffect(() => {
    const promo = queryParams.get('promo');
    if (promo && token) {
      const cleaned = promo.toUpperCase().trim();
      setPromoCodeInput(cleaned);
      handleAutoRedeem(cleaned);
    }
  }, [location.search, token]);

  const handleAutoRedeem = async (promoCode) => {
    setPromoLoading(true);
    setPromoError('');
    setPromoSuccess('');
    try {
      const response = await axios.post(
        `${API_URL}/api/payment/redeem-promo`,
        { code: promoCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.requiresPin) {
        setActivePromoCode(promoCode);
        setShowPinModal(true);
      } else {
        setPromoSuccess(response.data.message || 'Tự động nhận thành công mã sự kiện!');
        setPromoCodeInput('');
        if (refreshUser) await refreshUser();
      }
    } catch (error) {
      console.error("Auto redeem error:", error);
      if (error.response?.data?.requiresPin) {
        setActivePromoCode(promoCode);
        setShowPinModal(true);
      } else {
        setPromoError(error.response?.data?.message || 'Mã ưu đãi sự kiện không hợp lệ hoặc đã được sử dụng.');
      }
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRedeemPromo = async (e) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) {
      setPromoError('Vui lòng nhập mã ưu đãi.');
      return;
    }

    setPromoLoading(true);
    setPromoError('');
    setPromoSuccess('');

    const targetCode = promoCodeInput.toUpperCase().trim();

    try {
      const response = await axios.post(
        `${API_URL}/api/payment/redeem-promo`,
        { code: targetCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.requiresPin) {
        setActivePromoCode(targetCode);
        setShowPinModal(true);
      } else {
        setPromoSuccess(response.data.message || 'Áp dụng mã sự kiện thành công!');
        setPromoCodeInput('');
        if (refreshUser) await refreshUser();
      }
    } catch (error) {
      console.error("Redeem promo code error:", error);
      if (error.response?.data?.requiresPin) {
        setActivePromoCode(targetCode);
        setShowPinModal(true);
      } else {
        setPromoError(error.response?.data?.message || 'Mã ưu đãi không hợp lệ hoặc đã được sử dụng.');
      }
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRedeemWithPin = async (e) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setPromoError('Vui lòng nhập mã PIN xác thực.');
      return;
    }

    setPromoLoading(true);
    setPromoError('');
    setPromoSuccess('');

    try {
      const response = await axios.post(
        `${API_URL}/api/payment/redeem-promo`,
        { code: activePromoCode, pin: pinInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPromoSuccess(response.data.message || 'Nhận ưu đãi sự kiện thành công!');
      setShowPinModal(false);
      setPinInput('');
      setPromoCodeInput('');
      if (refreshUser) await refreshUser();
    } catch (error) {
      console.error("Redeem with pin error:", error);
      setPromoError(error.response?.data?.message || 'Mã PIN xác thực không chính xác.');
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <SeekerLayout title="Ưu đãi sự kiện" breadcrumb="Ví Credit › Sự kiện">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Intro Card */}
        <div className="rounded-[32px] bg-white/80 border border-slate-200/60 backdrop-blur-md p-10 text-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#F5C518]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#0A2463]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-[#0A2463] to-indigo-900 text-white rounded-2xl flex items-center justify-center text-3xl shadow-md">
              🎟️
            </div>

            <h2 className="text-3xl font-black text-[#0A2463] mb-4">Nhận quà từ Sự kiện & Workshop</h2>
            <p className="text-slate-650 mb-8 max-w-md mx-auto leading-relaxed font-medium">
              Nhập mã nhận được từ các buổi truyền thông của JobReady để quy đổi ra +90 credits miễn phí sử dụng cho dịch vụ chấm CV & phỏng vấn AI.
            </p>

            <form onSubmit={handleRedeemPromo} className="max-w-md mx-auto space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder="Nhập mã ưu đãi..."
                  className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0A2463] uppercase placeholder:normal-case font-bold text-slate-800 tracking-wider text-sm shadow-inner"
                  disabled={promoLoading}
                />
                <button
                  type="submit"
                  disabled={promoLoading}
                  className="rounded-2xl bg-[#0A2463] text-white hover:bg-[#071A4A] px-6 py-4 text-sm font-bold transition disabled:opacity-50 flex-shrink-0 shadow-md"
                >
                  {promoLoading ? 'Đang gửi...' : 'Áp dụng'}
                </button>
              </div>

              {promoSuccess && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3.5 text-sm text-emerald-700 shadow-md font-bold flex items-center justify-center gap-2 animate-fade-in">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span>✓ {promoSuccess}</span>
                </div>
              )}

              {promoError && (
                <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-3.5 text-sm text-red-750 shadow-md font-semibold flex items-center justify-center gap-2 animate-fade-in">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span>⚠ {promoError}</span>
                </div>
              )}
            </form>

            <div className="mt-8 bg-slate-50 border border-slate-200/80 rounded-3xl p-6 max-w-md mx-auto text-left">
              <h4 className="text-xs uppercase tracking-wider text-slate-450 font-bold mb-3">Lưu ý về quy trình xác thực</h4>
              <ul className="text-xs text-slate-550 space-y-2 list-disc list-inside font-medium leading-relaxed">
                <li>Mã ưu đãi sự kiện yêu cầu xác thực OTP qua Email.</li>
                <li>Hệ thống sẽ gửi một mã xác thực (OTP) ngẫu nhiên về hòm thư của tài khoản bạn đang đăng nhập ngay sau khi bạn nhấn Áp dụng.</li>
                <li>Vui lòng kiểm tra email để lấy mã OTP và điền vào form để nhận +90 credits thành công.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL XÁC THỰC PIN SỰ KIỆN ─── */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-2xl relative overflow-hidden">
            {/* Background glowing blob */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#F5C518]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#0A2463]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 text-slate-800 text-center">
              <div className="w-16 h-16 mx-auto mb-5 bg-[#0A2463]/5 text-[#0A2463] rounded-full flex items-center justify-center text-3xl shadow-sm">
                <KeyRound className="h-7 w-7 text-[#0A2463]" />
              </div>

              <h3 className="text-2xl font-black text-[#0A2463] mb-2">Xác thực OTP Email</h3>
              <p className="text-sm text-slate-500 mb-6 px-2 font-medium">
                Mã xác thực đã được gửi tới email của bạn. Vui lòng nhập mã để nhận ưu đãi: <br />
                <span className="font-extrabold text-slate-700 font-mono tracking-wider bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl inline-block mt-2">
                  {activePromoCode}
                </span>
              </p>

              <form onSubmit={handleRedeemWithPin} className="space-y-4">
                <div className="text-left">
                  <label htmlFor="pinCode" className="block text-xs font-bold text-slate-450 uppercase mb-2 tracking-wider">
                    Nhập mã OTP xác thực
                  </label>
                  <input
                    id="pinCode"
                    type="text"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Mã gồm 6 chữ số trong Email"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0A2463] font-bold text-center text-slate-800 tracking-wider text-sm placeholder:normal-case placeholder:font-medium shadow-inner"
                    required
                    autoFocus
                  />
                  <p className="mt-2 text-[11px] text-slate-400 italic text-center font-medium">
                    *(Vui lòng kiểm tra hộp thư email của bạn để lấy mã OTP)*
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPinModal(false);
                      setPinInput('');
                    }}
                    className="flex-1 rounded-2xl border border-slate-200 hover:bg-slate-50 py-3 text-sm font-bold text-slate-500 transition"
                  >
                    Hủy bộ
                  </button>
                  <button
                    type="submit"
                    disabled={promoLoading}
                    className="flex-1 rounded-2xl bg-[#0A2463] text-white hover:bg-[#071A4A] py-3 text-sm font-bold transition disabled:opacity-50"
                  >
                    {promoLoading ? 'Đang xác thực...' : 'Nhận Credit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </SeekerLayout>
  );
}
