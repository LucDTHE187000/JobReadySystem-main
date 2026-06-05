import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Target, Zap, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import SeekerLayout from '../components/layout/SeekerLayout';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const JOB_CATEGORIES = ['IT', 'Marketing', 'Sales', 'HR', 'Finance', 'Design', 'Business', 'Other'];
const INTERVIEW_TYPES = [
    { value: 'Technical', label: 'Kỹ thuật', icon: Zap, desc: 'Câu hỏi chuyên môn, lập trình, system design' },
    { value: 'Behavioral', label: 'Hành vi', icon: Users, desc: 'Kỹ năng mềm, teamwork, conflict resolution' },
    { value: 'Mixed', label: 'Hỗn hợp', icon: Target, desc: 'Kết hợp cả Technical lẫn Behavioral' },
];

const DIFFICULTY_LEVELS = [
    { level: 1, label: 'Fresher', desc: 'Mới ra trường' },
    { level: 2, label: 'Junior', desc: '1-2 năm kinh nghiệm' },
    { level: 3, label: 'Mid-level', desc: '3-5 năm kinh nghiệm' },
    { level: 4, label: 'Senior', desc: '5+ năm kinh nghiệm' },
    { level: 5, label: 'Expert', desc: 'Tech Lead / Manager' },
];

const inputClass =
    'w-full px-4 py-3 rounded-lg border border-[#DDE3F0] bg-white focus:ring-2 focus:ring-[#0A2463] focus:border-transparent outline-none transition';

export default function InterviewPractice() {
    const { user, refreshUser } = useAuth();
    const credits = user?.credits ?? 0;
    const sessionCost = 4000;
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        jobTitle: '',
        jobCategory: 'IT',
        interviewType: 'Mixed',
        jobDescription: '',
        difficultyLevel: 2,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cvScore, setCvScore] = useState(null);
    const [cvLoading, setCvLoading] = useState(true);
    const [hasCv, setHasCv] = useState(false);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const currentDifficulty = DIFFICULTY_LEVELS.find((d) => d.level === formData.difficultyLevel) || DIFFICULTY_LEVELS[1];

    useEffect(() => {
        const checkCVScore = async () => {
            try {
                setCvLoading(true);
                const res = await axios.get(`${API_URL}/api/cv/my-cv`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data?.cvs && res.data.cvs.length > 0) {
                    setHasCv(true);
                    const latestCv = res.data.cvs[res.data.cvs.length - 1];
                    if (latestCv?.analysis?.score) {
                        setCvScore(latestCv.analysis.score);
                    } else {
                        setCvScore(null);
                    }
                } else {
                    setHasCv(false);
                    setCvScore(null);
                }
            } catch (err) {
                console.error('Error fetching CV:', err);
                setHasCv(false);
                setCvScore(null);
            } finally {
                setCvLoading(false);
            }
        };

        if (token) {
            checkCVScore();
        }
    }, [token]);

    if (!user) {
        return (
            <div className="min-h-screen bg-[#F4F6FB] flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center">
                        <h2 className="font-heading text-3xl text-[#0A2463] mb-4">Vui lòng đăng nhập</h2>
                        <p className="text-[#5A6482] mb-6">Bạn cần đăng nhập để sử dụng tính năng Interview Practice</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-3 bg-[#0A2463] text-white font-medium rounded-lg hover:bg-[#071A4A] transition-colors"
                        >
                            Đăng nhập
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/api/interview/start`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                if (refreshUser) await refreshUser();
                navigate(`/interview/${response.data.data.sessionId}`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi tạo phiên phỏng vấn');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SeekerLayout title="Luyện phỏng vấn AI" breadcrumb="Phỏng vấn › Cấu hình">
            <div className="max-w-5xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2463] mb-2">Luyện tập phỏng vấn cùng AI</h1>
                    <p className="text-lg text-[#5A6482]">Luyện tập phỏng vấn với AI, nhận feedback realtime</p>

                    {/* CV Status Alert Box */}
                    {!cvLoading && (
                        <div className="mt-4">
                            {/* Case A: User has never uploaded or scanned a CV */}
                            {!hasCv && (
                                <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-4 shadow-sm">
                                    <FileText className="w-6 h-6 text-[#0A2463] flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-[#0A2463] text-sm sm:text-base">🚀 Tối ưu hóa phỏng vấn với CV của bạn</h4>
                                        <p className="text-xs sm:text-sm text-[#5A6482] mt-1 leading-relaxed">
                                            Bạn chưa tải lên CV. Bạn có thể <strong>tải lên CV có sẵn</strong> hoặc <strong>tự thiết kế CV online</strong> trực tiếp trên hệ thống để AI có thể chấm điểm, phân tích kỹ năng và đưa ra các câu hỏi phỏng vấn sát thực tế nhất cho bạn.
                                        </p>
                                        <div className="mt-3">
                                            <button
                                                onClick={() => navigate('/cv-upload')}
                                                className="px-4 py-2 bg-[#0A2463] hover:bg-[#071A4A] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Tải lên hoặc Thiết kế CV ngay
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Case B: User has scanned a CV and score < 60 */}
                            {hasCv && (cvScore === null || cvScore < 60) && (
                                <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4 shadow-sm">
                                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-amber-800 text-sm sm:text-base">⚠️ CV của bạn cần được cải thiện</h4>
                                        <p className="text-xs sm:text-sm text-amber-700 mt-1 leading-relaxed">
                                            Điểm CV của bạn hiện tại dưới mức khuyến nghị (60 điểm) {cvScore ? `(${cvScore}/100)` : ''}.
                                            Chúng tôi khuyên bạn nên cải thiện CV trước khi ứng tuyển. Tuy nhiên, bạn vẫn có thể tiếp tục luyện tập phỏng vấn.
                                        </p>
                                        <p className="text-xs sm:text-sm text-amber-600/90 mt-1.5 font-mono italic bg-amber-100/50 p-2 rounded-lg border border-amber-200/50">
                                            "Your CV score is below the recommended threshold (60 points). We recommend improving your CV before applying for jobs. However, you may still continue to practice interviews."
                                        </p>
                                        <div className="mt-3 flex gap-3">
                                            <button
                                                onClick={() => navigate('/cv-upload')}
                                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Cải thiện hoặc Tạo lại CV
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Case C: User has scanned a CV and score >= 60 */}
                            {hasCv && cvScore >= 60 && (
                                <div className="p-5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-4 shadow-sm">
                                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-green-800 text-sm sm:text-base">✓ CV đạt yêu cầu chất lượng</h4>
                                        <p className="text-xs sm:text-sm text-green-700 mt-1 leading-relaxed">
                                            CV của bạn đạt chất lượng khuyến nghị ({cvScore}/100). Bạn đã sẵn sàng để phỏng vấn.
                                        </p>
                                        <p className="text-xs sm:text-sm text-green-600/90 mt-1.5 font-mono italic bg-green-100/50 p-2 rounded-lg border border-green-200/50">
                                            "Your CV meets the recommended quality threshold. You are ready to participate in AI Interview."
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 border border-[#DDE3F0]">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
                            )}

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-[#0A2463] mb-2">Vị trí tuyển dụng</label>
                                <input
                                    type="text"
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                    placeholder="VD: Kỹ sư Phần mềm, Quản lý Sản phẩm..."
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-[#0A2463] mb-2">Lĩnh vực công việc</label>
                                <select
                                    value={formData.jobCategory}
                                    onChange={(e) => setFormData({ ...formData, jobCategory: e.target.value })}
                                    className={inputClass}
                                >
                                    {JOB_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-[#0A2463] mb-2">Mô tả công việc (Tùy chọn)</label>
                                <textarea
                                    value={formData.jobDescription}
                                    onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                                    placeholder="Dán mô tả công việc để AI tạo câu hỏi phù hợp..."
                                    rows={4}
                                    className={`${inputClass} resize-none`}
                                />
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-[#0A2463] mb-3">Loại phỏng vấn</label>
                                <div className="space-y-3">
                                    {INTERVIEW_TYPES.map(({ value, label, icon: Icon, desc }) => (
                                        <div
                                            key={value}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                                                formData.interviewType === value
                                                    ? 'border-[#0A2463] bg-[#0A2463]/5'
                                                    : 'border-[#DDE3F0] hover:border-[#0A2463]/30'
                                            }`}
                                            onClick={() => setFormData({ ...formData, interviewType: value })}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Icon
                                                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                                        formData.interviewType === value ? 'text-[#0A2463]' : 'text-gray-400'
                                                    }`}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-[#0A2463]">{label}</p>
                                                    <p className="text-sm text-[#5A6482]">{desc}</p>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="interviewType"
                                                    value={value}
                                                    checked={formData.interviewType === value}
                                                    onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
                                                    className="ml-auto accent-[#0A2463]"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mức độ khó — NEW */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-[#0A2463] mb-3">Mức độ khó</label>
                                <input
                                    type="range"
                                    min={1}
                                    max={5}
                                    step={1}
                                    value={formData.difficultyLevel}
                                    onChange={(e) =>
                                        setFormData({ ...formData, difficultyLevel: Number(e.target.value) })
                                    }
                                    className="difficulty-slider w-full mb-4"
                                />
                                <div className="flex justify-between text-xs text-[#5A6482] mb-3 px-1">
                                    {DIFFICULTY_LEVELS.map((d) => (
                                        <span key={d.level} className={formData.difficultyLevel === d.level ? 'text-[#0A2463] font-bold' : ''}>
                                            {d.level}
                                        </span>
                                    ))}
                                </div>
                                <div className="rounded-xl px-4 py-3 text-center bg-gradient-to-r from-[#0A2463] to-[#F5C518]">
                                    <p className="font-bold text-white text-lg">
                                        {currentDifficulty.level} — {currentDifficulty.label}
                                    </p>
                                    <p className="text-xs text-white/90 mt-1">{currentDifficulty.desc}</p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || credits < sessionCost}
                                className="w-full py-3 bg-[#0A2463] text-white font-semibold rounded-lg hover:bg-[#071A4A] disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                        Đang tạo phiên...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        Bắt đầu phỏng vấn
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#0A2463] rounded-2xl p-6 text-white border border-[#1A3A7C]">
                            <p className="text-xs uppercase text-white/60 mb-1">Chi phí phiên</p>
                            <p className="text-3xl font-bold text-[#F5C518]">{sessionCost.toLocaleString('vi-VN')} credit</p>
                            <p className="text-sm text-white/70 mt-2">Số dư: <span className="text-[#F5C518] font-semibold">{credits.toLocaleString('vi-VN')}</span></p>
                            {credits < sessionCost && (
                                <p className="text-red-300 text-xs mt-2">Không đủ credit — hãy nạp thêm tại Pricing.</p>
                            )}
                        </div>
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-[#DDE3F0] border-l-4 border-l-[#F5C518]">
                            <h3 className="font-bold text-[#0A2463] mb-4">Tính năng</h3>
                            <div className="space-y-3">
                                {[
                                    { icon: '🤖', text: 'AI sinh câu hỏi theo ngành' },
                                    { icon: '⚡', text: 'Feedback realtime' },
                                    { icon: '📊', text: 'Scoring & Analytics' },
                                    { icon: '🎯', text: 'Follow-up questions' },
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-lg">{feature.icon}</span>
                                        <p className="text-sm text-[#5A6482]">{feature.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#0A2463] rounded-2xl p-6 text-white">
                            <h3 className="font-bold mb-3">💡 Mẹo hay</h3>
                            <ul className="text-sm text-white/80 space-y-2">
                                <li>• Dán job description để câu hỏi chính xác hơn</li>
                                <li>• Chọn đúng mức độ khó phù hợp kinh nghiệm</li>
                                <li>• Xem lịch sử để track tiến độ</li>
                                <li>• Kiểm tra analytics để cải thiện</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </SeekerLayout>
    );
}
