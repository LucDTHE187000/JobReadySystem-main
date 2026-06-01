import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, ChevronRight } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

const POSITIONS = ['Frontend', 'Backend', 'Fullstack', 'DevOps', 'QA/Tester', 'Mobile', 'Data'];
const LEVELS = ['Intern', 'Fresher', 'Junior', 'Mid-level', 'Senior'];

export default function SelectPosition() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [position, setPosition] = useState('');
    const [level, setLevel] = useState('Fresher');
    const [loading, setLoading] = useState(false);

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center">
                        <p className="text-gray-600 mb-6">Vui lòng đăng nhập để bắt đầu luyện tập phỏng vấn</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600"
                        >
                            Đăng nhập
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const handleStart = async (e) => {
        e.preventDefault();
        if (!position) {
            alert('Vui lòng chọn vị trí công việc');
            return;
        }

        setLoading(true);
        // Điều hướng sang trang interview, truyền params
        setTimeout(() => {
            navigate(`/interview?position=${encodeURIComponent(position)}&level=${encodeURIComponent(level)}`);
        }, 300);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex flex-col">
            <Header />

            <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Chọn Vị Trí & Level</h1>
                    <p className="text-lg text-gray-600">Để AI sinh câu hỏi phù hợp với bạn</p>
                </div>

                <form onSubmit={handleStart} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 space-y-8">
                    {/* Position Selection */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-900 mb-4">
                            1️⃣ Vị trí công việc
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {POSITIONS.map((pos) => (
                                <button
                                    key={pos}
                                    type="button"
                                    onClick={() => setPosition(pos)}
                                    className={`py-3 px-4 rounded-lg font-medium transition-all border-2 ${
                                        position === pos
                                            ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {pos}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            💡 Chọn vị trí mà bạn muốn luyện tập
                        </p>
                    </div>

                    {/* Custom Position Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            👉 Hoặc nhập vị trí khác
                        </label>
                        <input
                            type="text"
                            placeholder="VD: Product Manager, Blockchain Developer..."
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Level Selection */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-900 mb-4">
                            2️⃣ Level kinh nghiệm
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {LEVELS.map((lv) => (
                                <button
                                    key={lv}
                                    type="button"
                                    onClick={() => setLevel(lv)}
                                    className={`py-3 px-4 rounded-lg font-medium transition-all border-2 ${
                                        level === lv
                                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {lv}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            💡 Level ảnh hưởng đến độ khó của câu hỏi
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!position || loading}
                        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 text-lg"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Đang tải...
                            </>
                        ) : (
                            <>
                                <Zap className="w-6 h-6" />
                                Bắt đầu phỏng vấn
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                            <strong>ℹ️ Lưu ý:</strong> Bạn sẽ khoảng 5-10 câu hỏi. Trả lời tốt nhất có thể. AI sẽ chấm điểm và đưa ra feedback lập tức.
                        </p>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
}
