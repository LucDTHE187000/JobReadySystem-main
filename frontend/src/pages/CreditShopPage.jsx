import { API_URL } from '@/config';
import { useState, useEffect, useRef, memo } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SeekerLayout from '../components/layout/SeekerLayout';
import SideBar from '../components/SideBar';
import { ArrowRight, CheckCircle, Clock3, Copy, DollarSign } from 'lucide-react';

const PACKAGES = [
  {
    id: 'starter',
    title: 'Starter',
    credits: 30,
    price: 29000,
    label: 'Tiết kiệm',
    description: 'Phân tích CV & Phỏng vấn cơ bản, lưu lịch sử 30 ngày.',
  },
  {
    id: 'pro',
    title: 'Pro',
    credits: 90,
    price: 79000,
    label: 'Tiêu chuẩn',
    description: 'Tặng thêm 10 Credits, lưu lịch sử 90 ngày & xuất báo cáo PDF.',
  },
  {
    id: 'max',
    title: 'Max',
    credits: 170,
    price: 149000,
    label: 'Cao cấp',
    description: 'Tặng thêm 30 Credits, lưu lịch sử không giới hạn, xuất PDF nâng cao, câu hỏi theo ngành & ưu tiên xử lý AI.',
  },
];

function formatCurrency(value) {
  return value.toLocaleString('vi-VN') + '₫';
}

// ─── Vẽ QR từ chuỗi text (VietQR string từ PayOS) ─────────────────────────
// Dùng Google Charts QR API — không cần npm install gì thêm
const QRCodeImage = memo(function QRCodeImage({ value, size = 280 }) {
  if (!value) return null;

  // Nếu đã là URL ảnh (http / data:) thì render thẳng
  if (value.startsWith('http') || value.startsWith('data:')) {
    return (
      <img
        src={value}
        alt="QR thanh toán"
        className="mx-auto object-contain"
        style={{ width: size, height: size }}
      />
    );
  }

  // Chuỗi VietQR text → encode thành QR ảnh qua Google Charts
  const encoded = encodeURIComponent(value);
  const src = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encoded}&choe=UTF-8`;

  return (
    <img
      src={src}
      alt="QR thanh toán"
      className="mx-auto object-contain rounded-2xl"
      style={{ width: size, height: size }}
      onError={(e) => {
        // Fallback: dùng QR Server nếu Google Charts bị block
        e.target.onerror = null;
        e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
      }}
    />
  );
});
// ─── Khai báo LayoutWrapper bên ngoài để tránh unmount/remount khi re-render ───
const LayoutWrapper = ({ children, user, sidebarOpen, setSidebarOpen, navigate }) => {
  if (user?.role === "EMPLOYER") {
    return (
      <div 
        className="min-h-screen flex bg-cover bg-center bg-no-repeat bg-fixed relative"
        style={{ backgroundImage: `url('/background3.jpg')` }}
      >
        <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px] pointer-events-none" />
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="relative z-10 flex w-full">
          <SideBar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            profile={user}
          />
          <main className="flex-1 overflow-auto w-full relative">
            <header className="sticky top-0 z-20 bg-white/70 border-b border-white/45 backdrop-blur-md px-4 lg:px-8 py-4 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4 flex-1">
                <h1 className="text-xl font-bold text-slate-800">Nạp credit tuyển dụng</h1>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-white/80 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl shadow-sm transition-all text-sm"
              >
                Quay lại Dashboard
              </button>
            </header>
            <div className="p-4 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }
  return (
    <SeekerLayout title="Nạp credit" breadcrumb="Credit › PayOS QR">
      {children}
    </SeekerLayout>
  );
};

export default function CreditShopPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Read package from query parameter if present
  const queryParams = new URLSearchParams(location.search);
  const packageParam = queryParams.get('package');
  const initialPackage = PACKAGES.find((p) => p.id === packageParam) || PACKAGES[1];

  const [selectedPackage, setSelectedPackage] = useState(initialPackage);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [verifyState, setVerifyState] = useState('idle');
  const [verifyMessage, setVerifyMessage] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const [timeLeft, setTimeLeft] = useState(600);
  const [timerExpired, setTimerExpired] = useState(false);
  const timerRef = useRef(null);
  const pollingRef = useRef(null);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // Redirect promo query parameter to /redeem?promo=CODE
  useEffect(() => {
    const promo = queryParams.get('promo');
    if (promo) {
      navigate(`/redeem?promo=${promo}`, { replace: true });
    }
  }, [location.search, navigate]);

  const clearTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    if (payment) {
      setTimeLeft(600);
      setTimerExpired(false);
      clearTimers();

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setTimerExpired(true);
            setVerifyState('error');
            setVerifyMessage('Mã QR thanh toán đã hết hạn. Vui lòng tạo mã QR mới.');
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start automatic polling every 5 seconds
      pollingRef.current = setInterval(async () => {
        try {
          const response = await axios.get(`${API_URL}/api/payment/verify/${payment.orderCode}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.success) {
            clearTimers();
            setVerifyState('success');
            let receivedText = `${response.data.creditAmount.toLocaleString()} credit`;
            if (response.data.creditAmount === 100) {
              receivedText = `90 credit + tặng 10 credit (Tổng cộng 100 credit)`;
            } else if (response.data.creditAmount === 200) {
              receivedText = `170 credit + tặng 30 credit (Tổng cộng 200 credit)`;
            }
            setVerifyMessage(`Thanh toán thành công! Bạn đã nhận ${receivedText}. Tự động chuyển hướng về trang Bảng giá...`);
            if (refreshUser) await refreshUser();
            setTimeout(() => {
              navigate('/pricing');
            }, 10000);
          }
        } catch (error) {
          console.error("Auto polling verification error:", error);
        }
      }, 5000);
    } else {
      clearTimers();
    }

    return () => clearTimers();
  }, [payment]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderCode = params.get('orderCode');
    const pkg = params.get('package');

    if (orderCode) {
      if (token) {
        const fetchOrderDetails = async () => {
          setLoading(true);
          setVerifyState('idle');
          setVerifyMessage('');
          try {
            const response = await axios.get(
              `${API_URL}/api/payment/details/${orderCode}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setPayment(response.data);
            // Map selected package matching the credit amount
            const foundPkg = PACKAGES.find((p) => p.credits === response.data.creditAmount) || PACKAGES[1];
            setSelectedPackage(foundPkg);
          } catch (error) {
            console.error("Load order details error:", error);
            setVerifyState('error');
            setVerifyMessage(error.response?.data?.message || 'Không thể lấy thông tin đơn hàng.');
          } finally {
            setLoading(false);
          }
        };
        fetchOrderDetails();
      } else {
        navigate('/login');
      }
    } else if (pkg) {
      const found = PACKAGES.find((p) => p.id === pkg);
      if (found) {
        setSelectedPackage(found);
        if (token) {
          const autoCreatePayment = async () => {
            setLoading(true);
            setVerifyState('idle');
            setVerifyMessage('');
            try {
              const response = await axios.post(
                `${API_URL}/api/payment/create-link`,
                { packageId: found.id },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setPayment(response.data);
            } catch (error) {
              console.error(error);
              setVerifyState('error');
              setVerifyMessage(error.response?.data?.message || 'Không thể tạo liên kết PayOS.');
            } finally {
              setLoading(false);
            }
          };
          autoCreatePayment();
        } else {
          navigate('/login');
        }
      }
    }
  }, [location.search, token, navigate]);

  const handleChoosePackage = (pack) => {
    setSelectedPackage(pack);
    setPayment(null);
    setVerifyState('idle');
    setVerifyMessage('');
  };

  const handleCreatePaymentLink = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setVerifyState('idle');
    setVerifyMessage('');

    try {
      const response = await axios.post(
        `${API_URL}/api/payment/create-link`,
        { packageId: selectedPackage.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayment(response.data);
    } catch (error) {
      console.error(error);
      setVerifyState('error');
      setVerifyMessage(error.response?.data?.message || 'Không thể tạo liên kết PayOS.');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (attempt = 1) => {
    setVerifyState('verifying');
    setVerifyMessage(`Kiểm tra trạng thái thanh toán... (${attempt}/5)`);

    try {
      const response = await axios.get(`${API_URL}/api/payment/verify/${payment.orderCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setVerifyState('success');
        let receivedText = `${response.data.creditAmount.toLocaleString()} credit`;
        if (response.data.creditAmount === 100) {
          receivedText = `90 credit + tặng 10 credit (Tổng cộng 100 credit)`;
        } else if (response.data.creditAmount === 200) {
          receivedText = `170 credit + tặng 30 credit (Tổng cộng 200 credit)`;
        }
        setVerifyMessage(`Thanh toán thành công! Bạn đã nhận ${receivedText}. Tự động chuyển hướng về trang Bảng giá...`);
        if (refreshUser) await refreshUser();
        setTimeout(() => {
          navigate('/pricing');
        }, 10000);
        return;
      }

      if (attempt < 5) {
        setTimeout(() => verifyPayment(attempt + 1), 2000);
      } else {
        setVerifyState('failed');
        setVerifyMessage('Chưa tìm thấy thanh toán. Vui lòng thử lại hoặc kiểm tra lại sau.');
      }
    } catch (error) {
      console.error(error);
      if (attempt < 5) {
        setTimeout(() => verifyPayment(attempt + 1), 2000);
      } else {
        setVerifyState('failed');
        setVerifyMessage(error.response?.data?.message || 'Xác minh thất bại.');
      }
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  const paymentDescription = payment?.description || `Gói ${payment?.packageName} ${payment?.creditAmount?.toLocaleString()} credit`;
  const paymentOwner = payment?.buyerName || 'DUONG TRONG LUC';

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <LayoutWrapper
      user={user}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      navigate={navigate}
    >
      <div className="max-w-5xl mx-auto space-y-10">
        {!payment && !loading && (
          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[32px] bg-white/80 border border-slate-200/60 backdrop-blur-md p-8 shadow-md text-slate-800">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-[0.18em]">Chọn gói credit</p>
                <h2 className="mt-3 text-3xl font-bold text-[#0A2463]">PayOS QR </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm flex-shrink-0">
                <CheckCircle className="h-4 w-4" /> Hỗ trợ PayOS
              </span>
            </div>

            <div className="grid gap-4">
              {PACKAGES.map((pack) => (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => handleChoosePackage(pack)}
                  className={`rounded-3xl border p-5 text-left transition ${selectedPackage.id === pack.id ? 'border-[#F5C518] bg-[#F5C518]/10 shadow-sm text-slate-900 font-bold' : 'border-slate-200 bg-white hover:border-[#F5C518]/40 text-slate-700'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">{pack.label}</p>
                      <h3 className="mt-2 text-2xl font-bold text-[#0A2463]">{pack.credits.toLocaleString()} credit</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-[#0A2463]">{formatCurrency(pack.price)}</p>
                      <p className="text-sm text-slate-500">/ gói</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">{pack.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleCreatePaymentLink}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#F5C518] text-[#0A2463] px-6 py-3 text-sm font-bold transition hover:bg-[#D4A800] disabled:opacity-50"
              >
                {loading ? 'Đang tạo mã QR...' : 'Tạo mã QR thanh toán'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Quay về bảng giá <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] bg-white/80 border border-slate-200/60 backdrop-blur-md p-8 text-slate-800 shadow-md">
              <div className="mb-6 bg-slate-50 border border-slate-200 p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Hướng dẫn thanh toán</p>
                <h3 className="mt-3 text-2xl font-bold">4 bước thanh toán</h3>
                <ol className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                  <li>1. Chọn gói credit phù hợp.</li>
                  <li>2. Nhấn "Tạo mã QR" — mã hiện ngay trong trang.</li>
                  <li>3. Mở app ngân hàng, quét QR và xác nhận.</li>
                  <li>4. Nhấn "Tôi đã thanh toán" để nhận credit.</li>
                </ol>
              </div>

              <div className="space-y-4 text-sm text-slate-600">
                <p><span className="font-bold text-slate-700">Gói đang chọn:</span> {selectedPackage.title}</p>
                <p><span className="font-bold text-slate-700">Credit nhận:</span> {selectedPackage.credits.toLocaleString()}</p>
                <p><span className="font-bold text-slate-700">Giá:</span> {formatCurrency(selectedPackage.price)}</p>
              </div>
            </div>
          </div>
        </section>
        )}

        {loading && !payment && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600 bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-[32px] shadow-md">
            <svg className="h-10 w-10 animate-spin text-[#F5C518] mb-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <p className="text-lg font-bold">Đang tạo mã QR thanh toán...</p>
          </div>
        )}

        {payment && (
          <section className="rounded-[32px] bg-white/80 border border-slate-200/60 backdrop-blur-md p-8 shadow-md text-slate-800">
            <div className="mb-6 rounded-3xl bg-slate-50 border border-slate-200 p-6 text-slate-700">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Thanh toán PayOS</p>
              <h2 className="mt-3 text-3xl font-bold">Quét mã QR để thanh toán</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Mở app ngân hàng hỗ trợ VietQR, quét mã và hoàn tất thanh toán.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              {/* ─── CỘT TRÁI: QR ─── */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-3 rounded-3xl bg-white p-4 border border-slate-200 mb-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5C518] text-[#0A2463] font-bold font-bold text-sm font-bold flex-shrink-0">
                    QR
                  </div>
                  <p className="text-sm text-slate-600">
                    Mở app ngân hàng → Quét QR → Kiểm tra số tiền <strong>{formatCurrency(payment.amount)}</strong> và xác nhận.
                  </p>
                </div>

                {/* ─── QR IMAGE ─── */}
                <div className="rounded-3xl bg-white p-6 flex flex-col items-center justify-center border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className={`transition-all duration-300 ${timerExpired ? 'filter blur-md opacity-20 pointer-events-none' : ''}`}>
                    {payment.qrCode ? (
                      <QRCodeImage value={payment.qrCode} size={260} />
                    ) : (
                      // Fallback: không có qrCode → nhúng iframe checkout PayOS
                      <div className="flex flex-col items-center gap-3 text-slate-400 py-8">
                        <p className="text-sm">Không nhận được mã QR từ PayOS.</p>
                        {payment.checkoutUrl && (
                          <a
                            href={payment.checkoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                          >
                            Mở trang thanh toán PayOS →
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {timerExpired && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-white/40 backdrop-blur-sm">
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-md max-w-xs">
                        <p className="text-red-700 font-bold text-sm">Mã QR đã hết hạn</p>
                        <p className="text-slate-500 text-xs mt-1">Vui lòng tạo mã QR mới để tiếp tục giao dịch.</p>
                      </div>
                    </div>
                  )}

                  {!timerExpired && (
                    <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold shadow-sm">
                      <Clock3 className="h-3.5 w-3.5 animate-pulse" />
                      <span>Hiệu lực QR còn lại: {formatTime(timeLeft)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 text-left shadow-sm">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Mã đơn hàng</p>
                    <p className="mt-2 text-lg font-bold text-slate-800">{payment.orderCode}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 text-left shadow-sm">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Số tiền</p>
                    <p className="mt-2 text-lg font-bold text-emerald-700">{formatCurrency(payment.amount)}</p>
                  </div>
                </div>
              </div>

              {/* ─── CỘT PHẢI: Thông tin chuyển khoản thủ công ─── */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="font-bold text-slate-800 mb-5 text-sm">Hoặc chuyển khoản thủ công</p>
                <div className="space-y-4">
                  {[
                    { label: 'Ngân hàng', value: 'BIDV' },
                    { label: 'Chủ tài khoản', value: paymentOwner },
                    { label: 'Số tài khoản', value: payment.accountNumber || '8898106444' },
                    { label: 'Số tiền', value: formatCurrency(payment.amount) },
                    { label: 'Nội dung', value: paymentDescription },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between rounded-3xl bg-white border border-slate-200 p-4 shadow-sm">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase text-slate-500 font-semibold">{label}</p>
                        <p className="mt-1 font-bold text-slate-800 break-words text-sm">{value}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(value, label)}
                        className="ml-3 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0A2463] text-white hover:bg-[#071A4A]"
                        title={`Sao chép ${label}`}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-3xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 shadow-sm">
                  <p className="font-semibold mb-1">⚠️ Lưu ý</p>
                  <p>Nhập <strong>chính xác</strong> số tiền và nội dung chuyển khoản để hệ thống tự động ghi nhận.</p>
                </div>
              </div>
            </div>

            {/* ─── ACTIONS ─── */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => verifyPayment(1)}
                disabled={verifyState === 'verifying' || verifyState === 'success'}
                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {verifyState === 'verifying' ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Đang xác minh...
                  </>
                ) : verifyState === 'success' ? (
                  '✅ Đã nhận credit'
                ) : (
                  'Tôi đã thanh toán xong'
                )}
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(payment.checkoutUrl || '', 'Liên kết PayOS')}
                className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-300 bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 hover:border-slate-400"
              >
                Sao chép link PayOS
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setPayment(null);
                  setVerifyState('idle');
                  setVerifyMessage('');
                  navigate('/credits', { replace: true });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-500 hover:border-slate-400"
              >
                Tạo QR mới
              </button>
            </div>

            {/* ─── STATUS MESSAGE ─── */}
            <div className="mt-5 rounded-3xl bg-slate-50 border border-slate-200 p-5">
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                <Clock3 className="h-4 w-4 flex-shrink-0" />
                <span>Credit được cộng <strong>ngay lập tức</strong> sau khi PayOS xác nhận thành công.</span>
              </div>
              {verifyMessage && (
                <p className={`text-sm font-medium ${
                  verifyState === 'success' ? 'text-emerald-700 font-bold' :
                  verifyState === 'failed' || verifyState === 'error' ? 'text-red-700 font-bold' :
                  'text-slate-700'
                }`}>
                  {verifyMessage}
                </p>
              )}
              {copiedField && (
                <div className="mt-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700 shadow-sm font-bold">
                  ✓ Đã sao chép {copiedField}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </LayoutWrapper>
  );
}