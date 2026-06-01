import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SeekerLayout from '../components/layout/SeekerLayout';
import { ArrowRight, CheckCircle, Clock3, Copy } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const PACKAGES = [
  {
    id: 'starter',
    title: 'Starter',
    credits: 5000,
    price: 19000,
    label: 'Tiết kiệm',
    description: 'Nạp 5.000 credit cho các tính năng cơ bản',
  },
  {
    id: 'pro',
    title: 'Pro',
    credits: 20000,
    price: 69000,
    label: 'Tiêu chuẩn',
    description: 'Nạp 20.000 credit, phù hợp cho ứng viên thường xuyên',
  },
  {
    id: 'max',
    title: 'Max',
    credits: 50000,
    price: 149000,
    label: 'Cao cấp',
    description: 'Nạp 50.000 credit cho nhu cầu sử dụng nâng cao',
  },
];

function formatCurrency(value) {
  return value.toLocaleString('vi-VN') + '₫';
}

// ─── Vẽ QR từ chuỗi text (VietQR string từ PayOS) ─────────────────────────
// Dùng Google Charts QR API — không cần npm install gì thêm
function QRCodeImage({ value, size = 280 }) {
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
}
// ──────────────────────────────────────────────────────────────────────────

export default function CreditShopPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[1]);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [verifyState, setVerifyState] = useState('idle');
  const [verifyMessage, setVerifyMessage] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

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
        setVerifyMessage(`Thanh toán thành công! Bạn đã nhận ${response.data.creditAmount.toLocaleString()} credit.`);
        if (refreshUser) await refreshUser();
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

  return (
    <SeekerLayout title="Nạp credit" breadcrumb="Credit › PayOS QR">
      <div className="max-w-5xl mx-auto space-y-10">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[32px] bg-white border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-[0.18em]">Chọn gói credit</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">PayOS QR </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                <CheckCircle className="h-4 w-4" /> Hỗ trợ PayOS
              </span>
            </div>

            <div className="grid gap-4">
              {PACKAGES.map((pack) => (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => handleChoosePackage(pack)}
                  className={`rounded-3xl border p-5 text-left transition ${selectedPackage.id === pack.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">{pack.label}</p>
                      <h3 className="mt-2 text-2xl font-bold text-slate-900">{pack.credits.toLocaleString()} credit</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(pack.price)}</p>
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
                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? 'Đang tạo mã QR...' : 'Tạo mã QR thanh toán'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="inline-flex items-center gap-2 rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Quay về bảng giá <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-[32px] bg-slate-900 p-8 text-white shadow-sm">
            <div className="mb-6 rounded-3xl bg-slate-800 p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Hướng dẫn thanh toán</p>
              <h3 className="mt-3 text-2xl font-bold">4 bước thanh toán</h3>
              <ol className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                <li>1. Chọn gói credit phù hợp.</li>
                <li>2. Nhấn "Tạo mã QR" — mã hiện ngay trong trang.</li>
                <li>3. Mở app ngân hàng, quét QR và xác nhận.</li>
                <li>4. Nhấn "Tôi đã thanh toán" để nhận credit.</li>
              </ol>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <p><span className="font-semibold text-white">Gói đang chọn:</span> {selectedPackage.title}</p>
              <p><span className="font-semibold text-white">Credit nhận:</span> {selectedPackage.credits.toLocaleString()}</p>
              <p><span className="font-semibold text-white">Giá:</span> {formatCurrency(selectedPackage.price)}</p>
            </div>
          </div>
        </section>

        {payment && (
          <section className="rounded-[32px] bg-white border border-slate-200 p-8 shadow-sm">
            <div className="mb-6 rounded-3xl bg-slate-950 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Thanh toán PayOS</p>
              <h2 className="mt-3 text-3xl font-bold">Quét mã QR để thanh toán</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Mở app ngân hàng hỗ trợ VietQR, quét mã và hoàn tất thanh toán.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              {/* ─── CỘT TRÁI: QR ─── */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white text-sm font-bold flex-shrink-0">
                    QR
                  </div>
                  <p className="text-sm text-slate-600">
                    Mở app ngân hàng → Quét QR → Kiểm tra số tiền <strong>{formatCurrency(payment.amount)}</strong> và xác nhận.
                  </p>
                </div>

                {/* ─── QR IMAGE ─── */}
                <div className="rounded-3xl bg-white p-6 flex items-center justify-center shadow-inner border border-slate-100">
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

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white p-5 shadow-sm text-left">
                    <p className="text-xs uppercase text-slate-500">Mã đơn hàng</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{payment.orderCode}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-5 shadow-sm text-left">
                    <p className="text-xs uppercase text-slate-500">Số tiền</p>
                    <p className="mt-2 text-lg font-semibold text-emerald-700">{formatCurrency(payment.amount)}</p>
                  </div>
                </div>
              </div>

              {/* ─── CỘT PHẢI: Thông tin chuyển khoản thủ công ─── */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="font-semibold text-slate-900 mb-5 text-sm">Hoặc chuyển khoản thủ công</p>
                <div className="space-y-4">
                  {[
                    { label: 'Ngân hàng', value: 'BIDV' },
                    { label: 'Chủ tài khoản', value: paymentOwner },
                    { label: 'Số tài khoản', value: payment.accountNumber || '8898106444' },
                    { label: 'Số tiền', value: formatCurrency(payment.amount) },
                    { label: 'Nội dung', value: paymentDescription },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase text-slate-500">{label}</p>
                        <p className="mt-1 font-semibold text-slate-900 break-words text-sm">{value}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(value, label)}
                        className="ml-3 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white hover:bg-slate-700"
                        title={`Sao chép ${label}`}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-3xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
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
                className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:border-slate-400"
              >
                Sao chép link PayOS
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => { setPayment(null); setVerifyState('idle'); setVerifyMessage(''); }}
                className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-500 hover:border-slate-400"
              >
                Tạo QR mới
              </button>
            </div>

            {/* ─── STATUS MESSAGE ─── */}
            <div className="mt-5 rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                <Clock3 className="h-4 w-4 flex-shrink-0" />
                <span>Credit được cộng <strong>ngay lập tức</strong> sau khi PayOS xác nhận thành công.</span>
              </div>
              {verifyMessage && (
                <p className={`text-sm font-medium ${
                  verifyState === 'success' ? 'text-emerald-700' :
                  verifyState === 'failed' || verifyState === 'error' ? 'text-red-600' :
                  'text-slate-600'
                }`}>
                  {verifyMessage}
                </p>
              )}
              {copiedField && (
                <div className="mt-3 rounded-2xl bg-emerald-100 px-4 py-2 text-sm text-emerald-700">
                  ✓ Đã sao chép {copiedField}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </SeekerLayout>
  );
}