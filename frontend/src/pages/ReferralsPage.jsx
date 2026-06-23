import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SeekerLayout from '../components/layout/SeekerLayout';
import { Copy, Gift, Users, CheckCircle, ArrowRight } from 'lucide-react';

export default function ReferralsPage() {
  const { user } = useAuth();
  const [copiedField, setCopiedField] = useState('');

  const referralCode = user?.referralCode || '';
  const referralLink = referralCode 
    ? `${window.location.origin}/register?ref=${referralCode}` 
    : '';

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <SeekerLayout title="Giới thiệu bạn bè" breadcrumb="Ví Credit › Giới thiệu">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Main Banner / Info Card */}
        <div className="rounded-[32px] bg-white/80 border border-slate-200/60 backdrop-blur-md p-8 md:p-10 text-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#F5C518]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#0A2463]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-gradient-to-tr from-[#0A2463] to-indigo-900 text-white rounded-3xl flex items-center justify-center text-4xl shadow-md flex-shrink-0 animate-pulse">
              🎁
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl md:text-3xl font-black text-[#0A2463] mb-3">Lan tỏa JobReady - Nhận quà cực lớn!</h2>
              <p className="text-slate-650 leading-relaxed font-medium">
                Chia sẻ JobReady tới bạn bè của bạn. Khi họ đăng ký tài khoản và xác thực thành công, cả hai sẽ cùng nhận được những phần quà credit miễn phí vào ví!
              </p>
            </div>
          </div>
        </div>

        {/* Action Panel & Code Display */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Referral Code & Link */}
          <div className="rounded-[32px] bg-white/80 border border-slate-200/60 backdrop-blur-md p-8 text-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-[#0A2463]" />
                <h3 className="text-lg font-bold text-[#0A2463]">Mã giới thiệu của bạn</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">Gửi mã này cho bạn bè nhập khi đăng ký tài khoản mới.</p>
              
              {referralCode ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <span className="text-lg font-black text-[#0A2463] tracking-widest font-mono bg-white px-4 py-1.5 rounded-xl shadow-inner border border-slate-100">
                      {referralCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(referralCode, 'code')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A2463] hover:bg-[#071A4A] px-4 py-2 text-xs font-bold text-white transition shadow-sm"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedField === 'code' ? 'Đã chép!' : 'Sao chép'}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      Hoặc gửi Link đăng ký nhanh
                    </label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <input
                        type="text"
                        readOnly
                        value={referralLink}
                        className="flex-1 bg-transparent border-none text-xs text-slate-600 font-mono focus:outline-none overflow-x-auto whitespace-nowrap px-2"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(referralLink, 'link')}
                        className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition flex-shrink-0"
                        title="Sao chép liên kết"
                      >
                        <Copy className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 text-slate-400 italic text-sm">
                  Đang tải mã giới thiệu...
                </div>
              )}
            </div>

            {copiedField && (
              <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs text-emerald-700 shadow-sm font-bold flex items-center gap-1.5 animate-fade-in">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Đã sao chép {copiedField === 'code' ? 'mã giới thiệu' : 'liên kết chia sẻ'} thành công!</span>
              </div>
            )}
          </div>

          {/* Right: Rules / Benefits Details */}
          <div className="rounded-[32px] bg-white/80 border border-slate-200/60 backdrop-blur-md p-8 text-slate-800 shadow-md">
            <div className="flex items-center gap-2 mb-6">
              <Gift className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-bold text-[#0A2463]">Quy tắc & Phần thưởng</h3>
            </div>

            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold flex-shrink-0 text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Bạn nhận quà giới thiệu</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Nhận ngay <span className="font-extrabold text-emerald-600">+15 credits</span> vào ví khi bạn bè hoàn tất việc đăng ký và xác thực tài khoản qua OTP.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/30 flex items-center justify-center text-amber-600 font-bold flex-shrink-0 text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Bạn của bạn nhận ưu đãi mới</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Bạn bè được cộng thêm <span className="font-extrabold text-amber-600">+10 credits</span> (tổng cộng nhận 70 credits khi bắt đầu sử dụng thay vì 60 credits mặc định).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold flex-shrink-0 text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Không giới hạn lượt mời</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Mời càng nhiều, số credit nhận được càng lớn để chấm CV và phỏng vấn AI không giới hạn!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SeekerLayout>
  );
}
