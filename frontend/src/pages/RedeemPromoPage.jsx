import { API_URL } from '@/config';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SeekerLayout from '../components/layout/SeekerLayout';
import { CheckCircle, AlertTriangle, KeyRound, Lock } from 'lucide-react';

export default function RedeemPromoPage() {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const queryParams = new URLSearchParams(location.search);

  // States
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState('');
  const [promoError, setPromoError] = useState('');

  // Event settings states
  const [promoRedemptionEnabled, setPromoRedemptionEnabled] = useState(true);
  const [activePromoCode, setActivePromoCode] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Event PIN verification states
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // Vòng quay may mắn states
  const canvasRef = useRef(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [spinTargetName, setSpinTargetName] = useState('');

  const segments = ['30 Credits', '50 Credits', '70 Credits', '90 Credits', '120 Credits', '150 Credits'];
  const colors = ['#0A2463', '#3F51B5', '#6366F1', '#8B5CF6', '#EC4899', '#D97706'];

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/payment/system-settings`);
        setPromoRedemptionEnabled(response.data?.promoRedemptionEnabled ?? true);
        setActivePromoCode(response.data?.activePromoCode ?? '');
      } catch (err) {
        console.error("Failed to fetch system settings:", err);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Vẽ Vòng quay trên Canvas
  useEffect(() => {
    if (settingsLoading || !promoRedemptionEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);

    const arcSize = (2 * Math.PI) / segments.length;

    // Draw slices
    segments.forEach((text, i) => {
      const angle = i * arcSize;
      
      // Vẽ phân vùng
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arcSize);
      ctx.lineTo(center, center);
      ctx.fill();

      // Đường kẻ viền trắng giữa các lát
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + radius * Math.cos(angle), center + radius * Math.sin(angle));
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Vẽ nhãn văn bản của phân vùng
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(text, radius - 18, 4);
      ctx.restore();
    });

    // Vẽ viền tròn ngoài cùng
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#0A2463';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Vẽ chấm tròn trang trí viền ngoài (đèn phát sáng)
    for (let dot = 0; dot < 12; dot++) {
      const dotAngle = (dot * Math.PI) / 6;
      ctx.beginPath();
      ctx.arc(
        center + (radius - 2) * Math.cos(dotAngle),
        center + (radius - 2) * Math.sin(dotAngle),
        3,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = dot % 2 === 0 ? '#F5C518' : '#FFFFFF';
      ctx.fill();
    }

    // Vẽ tâm vòng quay
    ctx.beginPath();
    ctx.arc(center, center, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#0A2463';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#F5C518';
    ctx.fill();
  }, [settingsLoading, promoRedemptionEnabled]);

  // Kiểm tra điều kiện tài khoản đã nhận quà chưa
  const hasAlreadyClaimed = () => {
    if (!user) return false;
    if (user.hasReceivedCampaignSignupBonus) return true;
    if (user.redeemedCodes && user.redeemedCodes.length > 0) return true;
    return false;
  };

  // Hàm gọi API của backend để gửi OTP
  const handleClaimPromo = async () => {
    if (!activePromoCode) {
      setPromoError('Không có chương trình ưu đãi sự kiện nào đang hoạt động.');
      return;
    }
    if (hasAlreadyClaimed()) {
      setPromoError('Tài khoản của bạn đã nhận ưu đãi sự kiện trước đó.');
      return;
    }

    setPromoLoading(true);
    setPromoError('');
    setPromoSuccess('');

    try {
      const response = await axios.post(
        `${API_URL}/api/payment/redeem-promo`,
        { code: activePromoCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.requiresPin) {
        setShowPinModal(true);
      } else {
        setPromoSuccess(response.data.message || 'Áp dụng mã sự kiện thành công!');
        if (refreshUser) await refreshUser();
      }
    } catch (error) {
      console.error("Claim promo error:", error);
      if (error.response?.data?.requiresPin) {
        setShowPinModal(true);
      } else {
        setPromoError(error.response?.data?.message || 'Mã ưu đãi không hợp lệ hoặc đã được sử dụng.');
      }
    } finally {
      setPromoLoading(false);
    }
  };

  // Xác thực mã OTP sau khi quay thưởng
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
      setHasSpun(true);
      if (refreshUser) await refreshUser();
    } catch (error) {
      console.error("Redeem with pin error:", error);
      setPromoError(error.response?.data?.message || 'Mã PIN xác thực không chính xác.');
    } finally {
      setPromoLoading(false);
    }
  };

  // Quay vòng quay may mắn
  const handleSpinClick = () => {
    if (isSpinning || hasAlreadyClaimed() || hasSpun) return;
    
    setIsSpinning(true);
    setPromoError('');
    setPromoSuccess('');

    // Segment index 3 (90 Credits) cần dừng ở vị trí mũi tên phía trên (270 độ)
    // Công thức: 9 vòng quay (360 * 9) + lệch 60 độ để căn chỉnh phân vùng + lệch ngẫu nhiên nhỏ
    const variance = Math.floor(Math.random() * 24) - 12; // Góc lệch tự nhiên ±12 độ
    const totalRotation = 360 * 9 + 60 + variance;
    
    setWheelRotation(totalRotation);

    // Chờ hiệu ứng chuyển động xoay hoàn thành (6 giây)
    setTimeout(() => {
      setIsSpinning(false);
      setSpinTargetName('90 Credits');
      // Tự động gọi API nhận quà để gửi mã xác thực OTP về Email
      handleClaimPromo();
    }, 6000);
  };

  // Tự động quay khi truy cập từ liên kết QR Code có tham số "?promo=CODE"
  useEffect(() => {
    const promoParam = queryParams.get('promo');
    if (promoParam && token && !settingsLoading && promoRedemptionEnabled) {
      const cleaned = promoParam.toUpperCase().trim();
      if (!hasAlreadyClaimed() && !isSpinning && !hasSpun) {
        // Kích hoạt xoay tự động khi quét QR Code
        handleSpinClick();
      }
    }
  }, [location.search, token, settingsLoading, promoRedemptionEnabled]);

  return (
    <SeekerLayout title="Ưu đãi sự kiện" breadcrumb="Ví Credit › Sự kiện">
      <div className="max-w-2xl mx-auto">
        
        {settingsLoading ? (
          <div className="rounded-[32px] bg-white/80 border border-slate-200/60 backdrop-blur-md p-12 text-center shadow-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A2463] mx-auto mb-4"></div>
            <p className="text-slate-550 font-medium">Đang tải cấu hình sự kiện...</p>
          </div>
        ) : !promoRedemptionEnabled ? (
          /* TRẠNG THÁI SỰ KIỆN ĐÓNG - GIAO DIỆN PHƯƠNG ÁN TÍCH LŨY THAY THẾ */
          <div className="space-y-8 animate-fade-in">
            <div className="rounded-[32px] bg-white/80 border border-slate-200/60 backdrop-blur-md p-10 text-slate-800 shadow-xl relative overflow-hidden text-center">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-slate-200/20 rounded-full blur-3xl pointer-events-none" />
              <div className="w-20 h-20 mx-auto mb-6 bg-slate-150 text-slate-400 rounded-full flex items-center justify-center">
                <Lock className="h-9 w-9 text-slate-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-700 mb-3">Vòng quay sự kiện đang tạm đóng</h2>
              <p className="text-slate-500 max-w-md mx-auto leading-relaxed text-sm font-medium mb-8">
                Hiện không có sự kiện nào đang diễn ra. Hãy theo dõi các kênh của JobReady để không bỏ lỡ phần quà tiếp theo nhé!
              </p>

              <div className="border-t border-slate-200/60 pt-8">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-6">
                  💡 Bạn có thể tích lũy credits miễn phí qua các kênh sau:
                </p>

                <div className="grid gap-6 sm:grid-cols-2 text-left">
                  {/* Option 1: Daily Checkin */}
                  <a
                    href="/checkin"
                    className="group rounded-3xl bg-white border border-slate-200 hover:border-[#0A2463]/40 p-6 shadow-sm hover:shadow-md transition duration-300 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#F5C518]/5 rounded-full group-hover:scale-125 transition-transform duration-300 pointer-events-none" />
                    <div>
                      <div className="text-2xl mb-3">📅</div>
                      <h4 className="font-bold text-[#0A2463] text-sm group-hover:underline">Điểm danh hàng ngày</h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                        Đăng nhập và điểm danh mỗi ngày để nhận ngay **+3 credits** miễn phí.
                      </p>
                    </div>
                    <div className="text-xs font-bold text-[#0A2463] flex items-center gap-1 mt-4 group-hover:translate-x-1 transition-transform">
                      Điểm danh ngay <span className="text-sm">→</span>
                    </div>
                  </a>

                  {/* Option 2: Referrals */}
                  <a
                    href="/referrals"
                    className="group rounded-3xl bg-white border border-slate-200 hover:border-[#0A2463]/40 p-6 shadow-sm hover:shadow-md transition duration-300 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/5 rounded-full group-hover:scale-125 transition-transform duration-300 pointer-events-none" />
                    <div>
                      <div className="text-2xl mb-3">🎁</div>
                      <h4 className="font-bold text-[#0A2463] text-sm group-hover:underline">Giới thiệu bạn bè</h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                        Mời bạn bè cùng tham gia JobReady để nhận ngay **+15 credits** cho mỗi lượt mời.
                      </p>
                    </div>
                    <div className="text-xs font-bold text-[#0A2463] flex items-center gap-1 mt-4 group-hover:translate-x-1 transition-transform">
                      Giới thiệu ngay <span className="text-sm">→</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TRẠNG THÁI VÒNG QUAY MAY MẮN HOẠT ĐỘNG */
          <div className="rounded-[32px] bg-white/80 border border-slate-200/60 backdrop-blur-md p-8 md:p-10 text-slate-800 shadow-xl relative overflow-hidden animate-fade-in">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#F5C518]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#0A2463]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              
              <div className="w-16 h-16 mb-4 bg-gradient-to-tr from-[#F5C518] to-amber-400 text-[#0A2463] rounded-2xl flex items-center justify-center text-2xl shadow-md">
                🎡
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0A2463] mb-2">Vòng quay may mắn</h2>
              <p className="text-slate-500 mb-8 max-w-md text-xs sm:text-sm font-medium leading-relaxed">
                Quay vòng quay để nhận ngay phần quà credits hấp dẫn từ hệ thống!
              </p>

              {/* Khu vực vòng quay */}
              <div className="relative w-72 h-72 mb-8 flex items-center justify-center">
                
                {/* Mũi tên chỉ hướng phía trên */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 drop-shadow-md">
                  <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 28L0 4H24L12 28Z" fill="#E91E63" />
                    <path d="M12 23L4 4H20L12 23Z" fill="#FF5252" />
                  </svg>
                </div>

                {/* Khối bọc Vòng quay xoay tròn */}
                <div
                  className={`w-64 h-64 rounded-full border-4 border-[#0A2463] shadow-2xl overflow-hidden bg-white ${hasAlreadyClaimed() ? 'filter grayscale opacity-40' : ''}`}
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transition: isSpinning ? 'transform 6000ms cubic-bezier(0.1, 0.85, 0.15, 1)' : 'none'
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={256}
                    height={256}
                    className="w-full h-full"
                  />
                </div>

                {/* Nút QUAY ở tâm */}
                <button
                  type="button"
                  onClick={handleSpinClick}
                  disabled={isSpinning || hasAlreadyClaimed() || hasSpun}
                  className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-[#0A2463] to-indigo-900 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xl z-30 transition hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSpinning ? 'SPIN!' : 'QUAY'}
                </button>
              </div>

              {/* Thông báo kết quả và Validation */}
              <div className="w-full max-w-md space-y-4">
                {hasAlreadyClaimed() ? (
                  <div className="space-y-3">
                    <div className="py-3.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-inner">
                      <CheckCircle className="h-5 w-5 text-emerald-500" /> Bạn đã tham gia vòng quay sự kiện này rồi
                    </div>
                    <p className="text-xs text-red-500/80 font-semibold bg-red-50 border border-red-100 rounded-xl py-2 px-3">
                      ⚠ Mỗi tài khoản chỉ được hưởng duy nhất 1 lần ưu đãi từ sự kiện hoặc ưu đãi khi đăng ký tài khoản.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 italic font-medium">
                      {isSpinning ? 'Vòng quay đang xoay, hãy chờ xem quà gì nhé...' : 'Nhấn nút QUAY ở trung tâm để rút thưởng!'}
                    </p>
                  </div>
                )}

                {promoSuccess && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3.5 text-sm text-emerald-700 shadow-md font-bold flex items-center justify-center gap-2 animate-fade-in">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{promoSuccess}</span>
                  </div>
                )}

                {promoError && (
                  <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-3.5 text-sm text-red-750 shadow-md font-semibold flex items-center justify-center gap-2 animate-fade-in">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <span>{promoError}</span>
                  </div>
                )}
              </div>

              {/* Hướng dẫn sử dụng */}
              <div className="mt-8 bg-slate-50 border border-slate-200/80 rounded-3xl p-6 max-w-md mx-auto text-left w-full">
                <h4 className="text-xs uppercase tracking-wider text-slate-450 font-bold mb-3 flex items-center gap-1">
                  <span>ℹ</span> Hướng dẫn nhận quà
                </h4>
                <ul className="text-xs text-slate-550 space-y-2 list-disc list-inside font-medium leading-relaxed">
                  <li>Nhấn nút **QUAY** ở tâm vòng quay để khởi động rút thưởng.</li>
                  <li>Khi vòng quay dừng lại ở ô giải thưởng, hệ thống sẽ tự động gửi mã OTP xác thực tới hòm thư email của bạn.</li>
                  <li>Nhập mã OTP vừa nhận được để hoàn tất quy đổi và cộng trực tiếp số dư credits tương ứng vào tài khoản.</li>
                </ul>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL XÁC THỰC PIN SỰ KIỆN ─── */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-2xl relative overflow-hidden">
            {/* Background glowing blob */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#F5C518]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#0A2463]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 text-slate-800 text-center">
              <div className="w-16 h-16 mx-auto mb-5 bg-[#0A2463]/5 text-[#0A2463] rounded-full flex items-center justify-center text-3xl shadow-sm animate-bounce">
                🎉
              </div>

              <h3 className="text-2xl font-black text-[#0A2463] mb-2">Chúc mừng bạn trúng {spinTargetName}!</h3>
              <p className="text-sm text-slate-500 mb-6 px-2 font-medium leading-relaxed">
                Vui lòng nhập mã OTP đã gửi đến email của bạn để nhận quà.
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
                    Hủy bỏ
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
