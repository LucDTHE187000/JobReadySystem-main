import { API_URL } from '@/config';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, BrainCircuit, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import GoogleLoginButton from '../components/ui/GoogleLoginButton';

const LOGIN_IMAGE = '/images/Login_side.png';

const highlights = [
    { icon: BrainCircuit, text: 'Luyện phỏng vấn AI mọi lúc' },
    { icon: FileText, text: 'Phân tích CV trong 30 giây' },
    { icon: TrendingUp, text: 'Theo dõi tiến bộ qua analytics' },
];

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, user } = useAuth();
    const navigate = useNavigate();

    // OTP states
    const [showOtpField, setShowOtpField] = useState(false);
    const [otp, setOtp] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resending, setResending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Forgot Password states
    const [forgotModalOpen, setForgotModalOpen] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [forgotNewPassword, setForgotNewPassword] = useState('');
    const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
    const [forgotCooldown, setForgotCooldown] = useState(0);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState('');

    // Redirect already-authenticated users
    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    // Parse email, password and unverified parameters on mount
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const urlEmail = queryParams.get('email');
        const urlPassword = queryParams.get('password');
        const isUnverified = queryParams.get('unverified') === 'true';
        if (urlEmail) {
            setEmail(urlEmail);
        }
        if (urlPassword) {
            setPassword(urlPassword);
        }
        if (isUnverified) {
            setShowOtpField(true);
            setSuccessMessage('Tài khoản chưa được xác thực email. Mã OTP đã được gửi đến email của bạn.');
        }
    }, []);

    // Cooldown timer for OTP resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Cooldown timer for Forgot Password OTP resend
    useEffect(() => {
        if (forgotCooldown > 0) {
            const timer = setTimeout(() => {
                setForgotCooldown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [forgotCooldown]);

    const handleResendOtp = async () => {
        if (resendCooldown > 0 || resending) return;
        if (!email.trim()) {
            setError('Vui lòng nhập email để gửi lại mã OTP');
            return;
        }
        setResending(true);
        setError('');
        setSuccessMessage('');
        try {

            await axios.post(`${API_URL}/api/auth/resend-otp`, { email: email.trim() });
            setSuccessMessage('Mã OTP mới đã được gửi lại vào email của bạn.');
            setResendCooldown(60);
        } catch (err) {
            console.error("Resend OTP failed:", err);
            setError(err.response?.data?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
        } finally {
            setResending(false);
        }
    };

    const handleForgotRequestOtp = async (e) => {
        if (e) e.preventDefault();
        if (!forgotEmail.trim()) {
            setForgotError('Vui lòng nhập email');
            return;
        }
        setForgotLoading(true);
        setForgotError('');
        try {

            await axios.post(`${API_URL}/api/auth/forgot-password`, { email: forgotEmail.trim() });
            setForgotStep(2);
            setForgotCooldown(60);
        } catch (err) {
            console.error("Forgot password OTP request failed:", err);
            setForgotError(err.response?.data?.message || 'Gửi mã OTP thất bại. Vui lòng thử lại.');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleVerifyForgotOtp = async (e) => {
        e.preventDefault();
        if (!forgotOtp.trim()) {
            setForgotError('Vui lòng nhập mã OTP');
            return;
        }
        setForgotLoading(true);
        setForgotError('');
        try {

            await axios.post(`${API_URL}/api/auth/verify-reset-otp`, {
                email: forgotEmail.trim(),
                otp: forgotOtp.trim()
            });
            setForgotStep(3);
        } catch (err) {
            console.error("Verify forgot password OTP failed:", err);
            setForgotError(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!forgotNewPassword) {
            setForgotError('Vui lòng nhập mật khẩu mới');
            return;
        }
        if (forgotNewPassword.length < 6) {
            setForgotError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }
        if (forgotNewPassword !== forgotConfirmPassword) {
            setForgotError('Mật khẩu xác nhận không trùng khớp');
            return;
        }
        setForgotLoading(true);
        setForgotError('');
        try {

            await axios.post(`${API_URL}/api/auth/reset-password`, {
                email: forgotEmail.trim(),
                password: forgotNewPassword
            });
            setSuccessMessage('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
            setEmail(forgotEmail.trim());
            setForgotModalOpen(false);
            // Reset state
            setForgotStep(1);
            setForgotEmail('');
            setForgotOtp('');
            setForgotNewPassword('');
            setForgotConfirmPassword('');
        } catch (err) {
            console.error("Reset password failed:", err);
            setForgotError(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!email.trim()) {
            setError('Email không được để trống');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError('Email không hợp lệ');
            return;
        }
        if (!password) {
            setError('Mật khẩu không được để trống');
            return;
        }
        if (showOtpField && !otp.trim()) {
            setError('Vui lòng nhập mã OTP');
            return;
        }

        setLoading(true);
        const result = await signIn(email, password, rememberMe, showOtpField ? otp : undefined);

        if (result.error) {
            const msg = result.error.message;
            if (msg === "Email not verified. Please verify your email first.") {
                setError('Tài khoản của bạn chưa được xác thực email. Vui lòng nhập mã OTP đã gửi đến email của bạn.');
                setShowOtpField(true);
            } else {
                setError(msg);
            }
            setLoading(false);
        } else {
            setLoading(false);
            navigate('/', { replace: true });
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <div className="hidden md:flex md:w-1/2 bg-[#0A2463] flex-col items-center justify-center p-12 relative overflow-hidden">
                <Link to="/" className="absolute top-8 left-8 flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src="/logo-jobready.png" alt="JobReady logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-heading text-2xl text-white tracking-wide">JOB<span className="text-[#F5C518]">READY</span></span>
                </Link>

                <div className="relative z-10 w-full max-w-sm">
                    <div className="bg-white/10 backdrop-blur p-4 rounded-3xl border border-white/20 relative">
                        <img src={LOGIN_IMAGE} alt="Professional" className="w-full h-72 object-cover rounded-2xl" />
                        <span className="absolute top-6 left-6 px-3 py-1.5 bg-[#F5C518] text-[#0A2463] font-bold text-xs rounded-full">
                            ✦ 50+ cơ hội việc làm
                        </span>
                    </div>
                </div>

                <div className="relative z-10 text-center max-w-md mt-8">
                    <h2 className="font-heading text-2xl sm:text-3xl text-white mb-3">KIẾN TẠO TƯƠNG LAI TẠI VIỆT NAM</h2>
                    <p className="text-white/70 text-sm mb-6">Đăng nhập để tiếp tục hành trình sự nghiệp của bạn.</p>
                    <div className="space-y-3 text-left">
                        {highlights.map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-[#F5C518]/15 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-[#F5C518]" />
                                </div>
                                <span className="text-white/80 text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white flex items-center justify-center p-8 md:p-12">
                <div className="w-full max-w-md">
                    <div className="md:hidden mb-8">
                        <Link to="/" className="flex items-center gap-2.5 font-heading text-3xl text-[#0A2463]">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#DDE3F0]">
                                <img src="/logo-jobready.png" alt="JobReady logo" className="w-full h-full object-cover" />
                            </div>
                            <span>JOB<span className="text-[#F5C518]">READY</span></span>
                        </Link>
                    </div>

                    <h1 className="font-heading text-3xl text-[#0A2463] mb-2">CHÀO MỪNG TRỞ LẠI</h1>
                    <p className="text-[#5A6482] mb-8">Vui lòng nhập thông tin để truy cập tài khoản</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
                    )}
                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{successMessage}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <label htmlFor="email" className="block text-sm font-semibold text-[#0A2463] mb-0">Địa chỉ Email</label>
                                <div className="group relative flex items-center">
                                    <AlertTriangle size={14} className="text-amber-500 cursor-pointer" />
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-72 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl shadow-lg z-50">
                                        <strong>Bạn hãy nhập email chính thức!</strong> Để nhận liên hệ từ nhà tuyển dụng và nhận lại mật khẩu mới khi sử dụng tính năng quên mật khẩu.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-100"></div>
                                    </div>
                                </div>
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@gmail.com"
                                className="w-full px-4 py-3 bg-[#F4F6FB] border border-[#DDE3F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463] focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-[#0A2463] mb-2">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu của bạn"
                                    className="w-full px-4 py-3 bg-[#F4F6FB] border border-[#DDE3F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463] pr-12"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5A6482] hover:text-[#0A2463]">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {showOtpField && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-2">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="otp" className="block text-sm font-semibold text-[#0A2463]">Mã xác thực OTP</label>
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={resendCooldown > 0 || resending}
                                        className="text-xs text-[#0A2463] hover:underline font-semibold disabled:text-gray-400"
                                    >
                                        {resendCooldown > 0 ? `Gửi lại mã (${resendCooldown}s)` : (resending ? 'Đang gửi...' : 'Gửi lại mã OTP')}
                                    </button>
                                </div>
                                <input
                                    id="otp"
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Nhập mã OTP 6 chữ số"
                                    className="w-full px-4 py-3 bg-[#F4F6FB] border border-[#DDE3F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463] text-center tracking-[0.2em] font-bold text-lg"
                                    required
                                />
                                <p className="text-[11px] text-[#5A6482] leading-normal">
                                    Vui lòng nhập mã xác thực OTP 6 chữ số được gửi tới email của bạn để kích hoạt tài khoản.
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center cursor-pointer gap-2">
                                <input type="checkbox" className="accent-[#0A2463] cursor-pointer" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                <span className="text-[#5A6482]">Ghi nhớ đăng nhập</span>
                            </label>
                            <button type="button" onClick={() => {
                                setForgotModalOpen(true);
                                setForgotStep(1);
                                setForgotError('');
                                setForgotSuccess('');
                            }} className="text-[#0A2463] font-semibold hover:underline">Quên mật khẩu?</button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#0A2463] text-white font-semibold rounded-lg hover:bg-[#071A4A] disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Đang đăng nhập...' : (
                                <>Đăng nhập ngay <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>

                        <p className="text-center text-sm text-[#5A6482]">— hoặc đăng nhập với —</p>

                        <div className="flex justify-center my-2">
                            <GoogleLoginButton />
                        </div>

                        <p className="text-center text-sm text-[#5A6482]">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-[#0A2463] font-semibold hover:underline">Đăng ký ngay</Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* Forgot Password Wizard Modal */}
            {forgotModalOpen && (
                <div className="fixed inset-0 bg-[#0A2463]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#DDE3F0] overflow-hidden relative animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-[#0A2463] text-white p-6 relative">
                            <button
                                onClick={() => setForgotModalOpen(false)}
                                className="absolute top-4 right-4 text-white/85 hover:text-white transition-colors text-lg"
                                type="button"
                            >
                                ✕
                            </button>
                            <h2 className="font-heading text-xl font-bold text-white">Quên mật khẩu</h2>
                            <p className="text-white/75 text-xs mt-1">Lấy lại mật khẩu qua email xác thực OTP</p>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex border-b border-[#DDE3F0] text-center text-xs font-semibold text-[#5A6482]">
                            <div className={`flex-1 py-3 border-b-2 transition-all ${forgotStep === 1 ? 'border-[#0A2463] text-[#0A2463] bg-[#0A2463]/5' : 'border-transparent'}`}>1. Nhập Email</div>
                            <div className={`flex-1 py-3 border-b-2 transition-all ${forgotStep === 2 ? 'border-[#0A2463] text-[#0A2463] bg-[#0A2463]/5' : 'border-transparent'}`}>2. Nhập OTP</div>
                            <div className={`flex-1 py-3 border-b-2 transition-all ${forgotStep === 3 ? 'border-[#0A2463] text-[#0A2463] bg-[#0A2463]/5' : 'border-transparent'}`}>3. Đổi mật khẩu</div>
                        </div>

                        <div className="p-6">
                            {forgotError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-in fade-in duration-100">
                                    {forgotError}
                                </div>
                            )}

                            {forgotStep === 1 && (
                                <form onSubmit={handleForgotRequestOtp} className="space-y-4">
                                    <div>
                                        <label htmlFor="forgotEmail" className="block text-sm font-semibold text-[#0A2463] mb-2">Email tài khoản</label>
                                        <input
                                            id="forgotEmail"
                                            type="email"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            placeholder="example@gmail.com"
                                            required
                                            className="w-full px-4 py-3 bg-[#F4F6FB] border border-[#DDE3F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={forgotLoading}
                                        className="w-full py-3 bg-[#0A2463] text-white font-semibold rounded-lg hover:bg-[#071A4A] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {forgotLoading ? 'Đang xử lý...' : <>Gửi mã OTP <ArrowRight size={16} /></>}
                                    </button>
                                </form>
                            )}

                            {forgotStep === 2 && (
                                <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                                    <div className="text-sm text-[#5A6482] mb-2">
                                        Mã OTP đã được gửi đến email: <strong className="text-[#0A2463]">{forgotEmail}</strong>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label htmlFor="forgotOtp" className="block text-sm font-semibold text-[#0A2463]">Nhập mã OTP</label>
                                            <button
                                                type="button"
                                                onClick={handleForgotRequestOtp}
                                                disabled={forgotCooldown > 0 || forgotLoading}
                                                className="text-xs text-[#0A2463] hover:underline font-semibold disabled:text-gray-400"
                                            >
                                                {forgotCooldown > 0 ? `Gửi lại mã (${forgotCooldown}s)` : 'Gửi lại mã OTP'}
                                            </button>
                                        </div>
                                        <input
                                            id="forgotOtp"
                                            type="text"
                                            maxLength={6}
                                            value={forgotOtp}
                                            onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Mã OTP 6 chữ số"
                                            required
                                            className="w-full px-4 py-3 bg-[#F4F6FB] border border-[#DDE3F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463] text-center tracking-[0.2em] font-bold text-lg"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setForgotStep(1)}
                                            className="flex-1 py-3 border border-[#DDE3F0] text-[#5A6482] font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Quay lại
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={forgotLoading}
                                            className="flex-1 py-3 bg-[#0A2463] text-white font-semibold rounded-lg hover:bg-[#071A4A] disabled:opacity-50 transition-colors"
                                        >
                                            {forgotLoading ? 'Đang xác thực...' : 'Xác thực'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {forgotStep === 3 && (
                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <div>
                                        <label htmlFor="forgotNewPassword" className="block text-sm font-semibold text-[#0A2463] mb-2">Mật khẩu mới</label>
                                        <input
                                            id="forgotNewPassword"
                                            type="password"
                                            value={forgotNewPassword}
                                            onChange={(e) => setForgotNewPassword(e.target.value)}
                                            placeholder="Tối thiểu 6 ký tự"
                                            required
                                            className="w-full px-4 py-3 bg-[#F4F6FB] border border-[#DDE3F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="forgotConfirmPassword" className="block text-sm font-semibold text-[#0A2463] mb-2">Xác nhận mật khẩu mới</label>
                                        <input
                                            id="forgotConfirmPassword"
                                            type="password"
                                            value={forgotConfirmPassword}
                                            onChange={(e) => setForgotConfirmPassword(e.target.value)}
                                            placeholder="Nhập lại mật khẩu mới"
                                            required
                                            className="w-full px-4 py-3 bg-[#F4F6FB] border border-[#DDE3F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={forgotLoading}
                                        className="w-full py-3 bg-[#0A2463] text-white font-semibold rounded-lg hover:bg-[#071A4A] disabled:opacity-50 transition-colors"
                                    >
                                        {forgotLoading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
