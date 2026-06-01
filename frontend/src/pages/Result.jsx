import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, BarChart3, ArrowRight, Trophy, TrendingUp } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

export default function InterviewResult() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem('interviewSession');
        if (!data) {
            navigate('/select-position');
            return;
        }

        try {
            const parsed = JSON.parse(data);
            setSession(parsed);
            // Clear localStorage
            localStorage.removeItem('interviewSession');
        } catch (error) {
            navigate('/select-position');
        }
    }, [navigate]);

    if (!session) return null;

    const totalScore = session.scores.reduce((a, b) => a + b, 0) / session.scores.length;
    const getScoreColor = (score) => {
        if (score >= 8) return { text: 'text-green-600', bg: 'bg-green-50' };
        if (score >= 6) return { text: 'text-blue-600', bg: 'bg-blue-50' };
        if (score >= 4) return { text: 'text-orange-600', bg: 'bg-orange-50' };
        return { text: 'text-red-600', bg: 'bg-red-50' };
    };

    const getScoreBadge = (score) => {
        if (score >= 8) return 'bg-green-100 text-green-800';
        if (score >= 6) return 'bg-blue-100 text-blue-800';
        if (score >= 4) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    const colors = getScoreColor(totalScore);

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex flex-col">
            <Header />

            <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Kết quả phỏng vấn</h1>
                    <p className="text-gray-600">
                        {session.position} • {session.level}
                    </p>
                </div>

                {/* Overall Score Card */}
                <div className={`rounded-2xl shadow-lg p-8 border border-gray-200 mb-8 ${colors.bg}`}>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Main Score */}
                        <div className="md:col-span-1 flex flex-col items-center justify-center">
                            <p className="text-sm text-gray-600 mb-2 font-semibold">ĐIỂM TRUNG BÌNH</p>
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="absolute w-full h-full" viewBox="0 0 120 120">
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="55"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        className="text-gray-300"
                                    />
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="55"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        strokeDasharray={`${(totalScore / 10) * 345.6} 345.6`}
                                        className={colors.text}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="text-center">
                                    <p className={`text-4xl font-bold ${colors.text}`}>{totalScore.toFixed(1)}</p>
                                    <p className="text-gray-600">/10</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="md:col-span-2 space-y-4">
                            {session.scores.map((score, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="text-sm font-semibold text-gray-600 w-20">
                                        Câu {i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-blue-500' : score >= 4 ? 'bg-orange-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${(score / 10) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className={`font-bold px-2 py-1 rounded text-sm ${getScoreBadge(score)}`}>
                                        {score}/10
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detailed Results */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-cyan-600" />
                        Chi tiết từng câu
                    </h2>

                    <div className="space-y-6">
                        {session.questions.map((question, i) => {
                            const feedback = session.feedbacks[i];
                            const score = session.scores[i];

                            return (
                                <div key={i} className="border border-gray-200 rounded-xl p-6">
                                    {/* Question Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                Câu {i + 1}
                                            </span>
                                            <p className="font-semibold text-gray-900 mt-2">{question}</p>
                                        </div>
                                        <div className={`text-3xl font-bold ${getScoreColor(score).text}`}>
                                            {score}/10
                                        </div>
                                    </div>

                                    {/* User Answer */}
                                    <div className="mb-4 bg-gray-50 rounded-lg p-4">
                                        <p className="text-xs text-gray-600 font-semibold mb-2">CÂU TRẢ LỜI CỦA BẠN</p>
                                        <p className="text-gray-700 text-sm leading-relaxed">{session.answers[i]}</p>
                                    </div>

                                    {/* Feedback */}
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                                <span>📝 NHẬN XÉT</span>
                                            </p>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {feedback?.feedback}
                                            </p>
                                        </div>

                                        {feedback?.strengths?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-2">
                                                    <span>✓ ĐIỂM TỐT</span>
                                                </p>
                                                <ul className="text-sm text-gray-700 space-y-1">
                                                    {feedback.strengths.map((s, j) => (
                                                        <li key={j} className="flex gap-2">
                                                            <span className="text-green-600">•</span>
                                                            <span>{s}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {feedback?.weaknesses?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-orange-700 mb-1 flex items-center gap-2">
                                                    <span>⚠ CẦN CẢI THIỆN</span>
                                                </p>
                                                <ul className="text-sm text-gray-700 space-y-1">
                                                    {feedback.weaknesses.map((w, j) => (
                                                        <li key={j} className="flex gap-2">
                                                            <span className="text-orange-600">•</span>
                                                            <span>{w}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {feedback?.suggestions?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-2">
                                                    <span>💡 GỢI Ý CẢI THIỆN</span>
                                                </p>
                                                <ul className="text-sm text-gray-700 space-y-1">
                                                    {feedback.suggestions.map((s, j) => (
                                                        <li key={j} className="flex gap-2">
                                                            <span className="text-blue-600">•</span>
                                                            <span>{s}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/select-position')}
                        className="py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition flex items-center justify-center gap-2"
                    >
                        <TrendingUp className="w-5 h-5" />
                        Luyện tập lại
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        In kết quả
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
}
