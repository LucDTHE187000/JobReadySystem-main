
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const REGISTER_IMAGE = '/images/Register_side.png';

const featurePills = [
    '🎯 CV Gate — Chỉ CV đạt chuẩn',
    '🤖 AI phỏng vấn thích ứng',
    '📊 Analytics tiến trình',
];

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [userType, setUserType] = useState('candidate');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp, user } = useAuth();
    const navigate = useNavigate();

    // Redirect already-authenticated users
    useEffect(() => {
        if (user) {
            if (user.role === 'EMPLOYER' || user.role === 'employer') navigate('/employer/dashboard', { replace: true });
            else if (user.role === 'ADMIN' || user.role === 'admin') navigate('/admin/dashboard', { replace: true });
            else navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!fullName.trim()) {
            setError('Họ và tên không được để trống');
            return;
        }
        if (fullName.trim().length < 2) {
            setError('Họ và tên phải có ít nhất 2 ký tự');
            return;
        }
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
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        const result = await signUp(email, password, fullName, userType);

        if (result.error) {
            setError(result.error.message);
            setLoading(false);
        } else {
            setSuccessMessage('Đăng ký thành công! Chuyển hướng đến trang đăng nhập...');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#0A2463] to-[#1A3A7C] flex-col p-12 relative overflow-hidden">
                <Link to="/" className="flex items-center gap-2.5 mb-8 relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-[#F5C518] flex items-center justify-center">
                        <span className="font-heading text-[#0A2463] text-xl leading-none pt-0.5">JR</span>
                    </div>
                    <span className="font-heading text-2xl text-white tracking-wide">JOB<span className="text-[#F5C518]">READY</span></span>
                </Link>

                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <img src={REGISTER_IMAGE} alt="Office" className="w-full max-w-md rounded-2xl shadow-2xl mb-8 object-cover h-56" />

                    <h2 className="font-heading text-3xl text-white mb-6">MỞ KHÓA CƠ HỘI NGHỀ NGHIỆP</h2>

                    <div className="space-y-3">
                        {featurePills.map((pill) => (
                            <div key={pill} className="bg-white/10 rounded-xl px-4 py-2.5 text-white text-sm flex items-center gap-3">
                                {pill}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white flex items-center justify-center p-8 md:p-12">
                <div className="w-full max-w-md">
                    <div className="md:hidden mb-8">
                        <Link to="/" className="font-heading text-3xl text-[#0A2463]">JOB<span className="text-[#F5C518]">READY</span></Link>
                    </div>

                    <h1 className="font-heading text-3xl text-[#0A2463] mb-2">TẠO TÀI KHOẢN MỚI</h1>
                    <p className="text-[#5A6482] mb-8">Bắt đầu hành trình tìm kiếm sự nghiệp của bạn ngay hôm nay</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
                    )}
                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{successMessage}</div>
                    )}

                    <div className="flex gap-3 mb-6">
                        {[
                            { id: 'candidate', label: 'Người tìm việc', icon: User },
                            { id: 'employer', label: 'Nhà tuyển dụng', icon: Briefcase },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setUserType(id)}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 text-sm font-semibold ${
                                    userType === id
                                        ? 'border-[#0A2463] bg-[#0A2463]/5 text-[#0A2463]'
                                        : 'border-[#DDE3F0] text-[#5A6482] hover:border-[#0A2463]/40'
                                }`}
                            >
                                <Icon size={18} />
                                {label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-semibold text-[#0A2463] mb-2">Họ và tên</label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Nhập họ và tên đầy đủ"
                                className="w-full px-4 py-3 bg-[#F4F6FB] border border-[#DDE3F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-[#0A2463] mb-2">Email công việc</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@email.com"
                                className="w-full px-4 py-3 bg-[#F4F6FB] border border-[#DDE3F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-[#0A2463] mb-2">Mật khẩu</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-[#F4F6FB] border border-[#DDE3F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463] pr-11"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6482]">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#0A2463] mb-2">Xác nhận</label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-[#F4F6FB] border border-[#DDE3F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463] pr-11"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6482]">
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1 accent-[#0A2463]" required />
                            <p className="text-xs text-[#5A6482]">
                                Tôi đồng ý với <span className="text-[#0A2463] font-semibold cursor-pointer hover:underline">Điều khoản dịch vụ</span> và{' '}
                                <span className="text-[#0A2463] font-semibold cursor-pointer hover:underline">Chính sách bảo mật</span>
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#0A2463] text-white font-semibold rounded-lg hover:bg-[#071A4A] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Đang đăng ký...' : (
                                <>Đăng ký ngay <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>

                        <p className="text-center text-sm text-[#5A6482]">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="text-[#0A2463] font-semibold hover:underline">Đăng nhập</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
