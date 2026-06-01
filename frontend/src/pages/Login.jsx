
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, BrainCircuit, FileText, TrendingUp } from 'lucide-react';

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
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signIn(email, password, rememberMe);

        if (result.error) {
            setError(result.error.message);
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <div className="hidden md:flex md:w-1/2 bg-[#0A2463] flex-col items-center justify-center p-12 relative overflow-hidden">
                <Link to="/" className="absolute top-8 left-8 flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-[#F5C518] flex items-center justify-center">
                        <span className="font-heading text-[#0A2463] text-xl leading-none pt-0.5">JR</span>
                    </div>
                    <span className="font-heading text-2xl text-white tracking-wide">JOB<span className="text-[#F5C518]">READY</span></span>
                </Link>

                <div className="relative z-10 w-full max-w-sm">
                    <div className="bg-white/10 backdrop-blur p-4 rounded-3xl border border-white/20 relative">
                        <img src={LOGIN_IMAGE} alt="Professional" className="w-full h-72 object-cover rounded-2xl" />
                        <span className="absolute top-6 left-6 px-3 py-1.5 bg-[#F5C518] text-[#0A2463] font-bold text-xs rounded-full">
                            ✦ 50,000+ cơ hội việc làm
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
                        <Link to="/" className="font-heading text-3xl text-[#0A2463]">JOB<span className="text-[#F5C518]">READY</span></Link>
                    </div>

                    <h1 className="font-heading text-3xl text-[#0A2463] mb-2">CHÀO MỪNG TRỞ LẠI</h1>
                    <p className="text-[#5A6482] mb-8">Vui lòng nhập thông tin để truy cập tài khoản</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-[#0A2463] mb-2">Địa chỉ Email</label>
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

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center cursor-pointer gap-2">
                                <input type="checkbox" className="accent-[#0A2463] cursor-pointer" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                <span className="text-[#5A6482]">Ghi nhớ đăng nhập</span>
                            </label>
                            <button type="button" className="text-[#0A2463] font-semibold hover:underline">Quên mật khẩu?</button>
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

                        <p className="text-center text-sm text-[#5A6482]">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-[#0A2463] font-semibold hover:underline">Đăng ký ngay</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
