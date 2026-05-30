import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart3, ArrowRight, TrendingUp } from 'lucide-react';
import SeekerLayout from '../components/layout/SeekerLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function InterviewResult() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessionDetails();
    }, [sessionId]);

    const fetchSessionDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${API_URL}/api/interview/${sessionId}/details`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSession(response.data.data.session);
                setQuestions(response.data.data.questions);
            }
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreBadge = (score) => {
        if (score >= 80) return 'bg-green-100 text-green-700';
        if (score >= 60) return 'bg-[#F5C518]/20 text-[#0A2463]';
        return 'bg-red-100 text-red-600';
    };

    const getRatingLabel = (score) => {
        if (score >= 80) return { text: 'Xuất sắc', class: 'bg-green-100 text-green-700' };
        if (score >= 60) return { text: 'Tốt', class: 'bg-[#F5C518]/20 text-[#0A2463]' };
        return { text: 'Cần cải thiện', class: 'bg-red-100 text-red-600' };
    };

    if (loading || !session) {
        return (
            <SeekerLayout title="Kết quả phỏng vấn">
                <div className="flex items-center justify-center py-20">
                    <p className="text-[#5A6482]">Đang tải kết quả...</p>
                </div>
            </SeekerLayout>
        );
    }

    const rating = getRatingLabel(session.averageScore);

    const radarScores = [
        Math.min(100, session.averageScore + 5),
        Math.min(100, session.averageScore - 5),
        session.averageScore,
        Math.min(100, session.averageScore - 10),
        Math.min(100, session.averageScore + 2),
    ];

    return (
        <SeekerLayout title="Kết quả phỏng vấn" breadcrumb={`Activity Hub › ${session.jobTitle || 'PV'}`}>
            <div className="max-w-6xl mx-auto w-full">
                {/* Hero result */}
                <div className="bg-[#0A2463] text-white rounded-3xl p-8 shadow-xl mb-8">
                    <h1 className="font-heading text-3xl sm:text-4xl mb-6">KẾT QUẢ PHỎNG VẤN</h1>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-8">
                        <div>
                            <span className="font-heading text-7xl text-[#F5C518] leading-none">{session.averageScore}</span>
                            <span className="text-white/60 text-xl ml-1">/100</span>
                        </div>
                        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${rating.class}`}>
                            {rating.text}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white/10 rounded-2xl px-6 py-4">
                            <p className="text-white/60 text-xs mb-1">Thời gian</p>
                            <p className="font-bold text-white">
                                {Math.floor(session.duration / 60)}m {session.duration % 60}s
                            </p>
                        </div>
                        <div className="bg-white/10 rounded-2xl px-6 py-4">
                            <p className="text-white/60 text-xs mb-1">Câu hỏi đã trả lời</p>
                            <p className="font-bold text-white">
                                {session.answeredQuestions}/{session.totalQuestions}
                            </p>
                        </div>
                        <div className="bg-white/10 rounded-2xl px-6 py-4">
                            <p className="text-white/60 text-xs mb-1">Ngày phỏng vấn</p>
                            <p className="font-bold text-white">
                                {new Date(session.completedAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-[#071A4A] rounded-2xl p-6 text-white">
                        <p className="text-xs text-white/50 uppercase mb-2">Điểm tổng quát</p>
                        <p className="text-5xl font-bold text-[#F5C518]">{session.averageScore}<span className="text-lg text-white/50">/100</span></p>
                        <p className="mt-3 text-sm text-white/70">
                            {session.averageScore >= 80 ? 'Đề xuất: Tiếp tục vòng sau' : session.averageScore >= 60 ? 'Đề xuất: Cần luyện thêm' : 'Đề xuất: Cần đào tạo thêm'}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#DDE3F0] p-6">
                        <p className="font-bold text-[#0A2463] mb-4">Bản đồ năng lực</p>
                        <div className="flex justify-center">
                            <div className="relative w-64 h-64">
                                <svg viewBox="0 0 200 200" className="w-full h-full">
                                    {[25, 50, 75, 100].map((pct) => (
                                        <polygon key={pct} points={radarScores.map((_, i) => {
                                            const angle = (Math.PI * 2 * i) / radarScores.length - Math.PI / 2;
                                            const rad = (pct / 100) * 70;
                                            return `${100 + rad * Math.cos(angle)},${100 + rad * Math.sin(angle)}`;
                                        }).join(' ')} fill="none" stroke="#DDE3F0" strokeWidth="1" />
                                    ))}
                                    <polygon points={radarScores.map((v, i) => {
                                        const angle = (Math.PI * 2 * i) / radarScores.length - Math.PI / 2;
                                        const rad = (v / 100) * 70;
                                        return `${100 + rad * Math.cos(angle)},${100 + rad * Math.sin(angle)}`;
                                    }).join(' ')} fill="#F5A962" fillOpacity="0.25" stroke="#E97E3F" strokeWidth="2" />
                                    
                                    {/* Vertex labels with scores */}
                                    {['Thái độ', 'Tự tin', 'Chuyên môn', 'Tư duy', 'Mềm'].map((label, i) => {
                                        const angle = (Math.PI * 2 * i) / radarScores.length - Math.PI / 2;
                                        const rad = 95;
                                        const x = 100 + rad * Math.cos(angle);
                                        const y = 100 + rad * Math.sin(angle);
                                        return (
                                            <g key={i}>
                                                <text
                                                    x={x}
                                                    y={y}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="text-xs font-bold fill-[#0A2463]"
                                                    fontSize="12"
                                                >
                                                    {label}
                                                </text>
                                                <text
                                                    x={x}
                                                    y={y + 12}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="text-xs font-semibold fill-[#F5C518]"
                                                    fontSize="11"
                                                >
                                                    {radarScores[i]}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        </div>
                        <div className="text-center mt-4 text-xs text-[#5A6482]">
                            <p className="font-semibold">Điểm chi tiết: {radarScores.map(s => s).join(' - ')}</p>
                        </div>
                    </div>
                </div>

                {session.overallFeedback && (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#DDE3F0] p-8 mb-8">
                        <h2 className="font-heading text-2xl text-[#0A2463] mb-4">Nhận xét chung</h2>
                        <p className="text-[#5A6482] leading-relaxed">{session.overallFeedback}</p>
                    </div>
                )}

                {session.strengths?.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 border border-[#DDE3F0]">
                            <p className="text-xs font-semibold text-green-700 mb-3">ĐIỂM MẠNH</p>
                            <ul className="space-y-2">
                                {session.strengths.map((s, i) => (
                                    <li key={i} className="text-sm text-[#5A6482] flex gap-2">
                                        <span className="text-green-600">✓</span>{s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {session.improvements?.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 border border-[#DDE3F0]">
                                <p className="text-xs font-semibold text-[#0A2463] mb-3">CẦN CẢI THIỆN</p>
                                <ul className="space-y-2">
                                    {session.improvements.map((imp, i) => (
                                        <li key={i} className="text-sm text-[#5A6482] flex gap-2">
                                            <span className="text-[#F5C518]">→</span>{imp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {session.nextSteps?.length > 0 && (
                    <div className="bg-[#0A2463]/5 rounded-2xl border border-[#DDE3F0] p-8 mb-8">
                        <h2 className="font-heading text-2xl text-[#0A2463] mb-4 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-[#F5C518]" />
                            Các bước tiếp theo
                        </h2>
                        <ol className="space-y-3">
                            {session.nextSteps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-[#0A2463] text-[#F5C518] rounded-full flex items-center justify-center font-bold text-sm">
                                        {i + 1}
                                    </span>
                                    <span className="text-[#5A6482] pt-1">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-[#DDE3F0] p-8 mb-8">
                    <h2 className="font-heading text-2xl text-[#0A2463] mb-6 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-[#0A2463]" />
                        Chi tiết từng câu
                    </h2>

                    <div className="space-y-6">
                        {questions.map((q, index) => (
                            <div key={q._id} className="rounded-2xl border border-[#DDE3F0] overflow-hidden">
                                <div className="flex items-start justify-between p-6 pb-4">
                                    <div>
                                        <span className="text-sm font-semibold text-[#5A6482]">Câu {index + 1}</span>
                                        <p className="font-semibold text-[#0A2463] mt-1">{q.questionText}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreBadge(q.aiScore)}`}>
                                        {q.aiScore}
                                    </span>
                                </div>

                                <div className="px-6 pb-4">
                                    <div className="bg-[#F4F6FB] rounded-xl p-4">
                                        <p className="text-xs text-[#5A6482] font-semibold mb-2">Câu trả lời của bạn</p>
                                        <p className="text-[#5A6482] text-sm">{q.userAnswer}</p>
                                    </div>
                                </div>

                                <div className="px-6 pb-6 space-y-3">
                                    {q.keyPoints?.length > 0 && (
                                        <div className="bg-green-50 border-l-4 border-green-400 rounded-r-xl p-4">
                                            <p className="text-xs font-semibold text-green-700 mb-2">Điểm đạt ✅</p>
                                            <ul className="text-sm text-[#5A6482] space-y-1">
                                                {q.keyPoints.map((p, i) => <li key={i}>• {p}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {q.missedPoints?.length > 0 && (
                                        <div className="bg-[#F5C518]/10 border-l-4 border-[#F5C518] rounded-r-xl p-4">
                                            <p className="text-xs font-semibold text-[#0A2463] mb-2">Điểm thiếu ⚠️</p>
                                            <ul className="text-sm text-[#5A6482] space-y-1">
                                                {q.missedPoints.map((p, i) => <li key={i}>• {p}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {q.suggestions?.length > 0 && (
                                        <div className="bg-[#0A2463]/5 border-l-4 border-[#0A2463] rounded-r-xl p-4">
                                            <p className="text-xs font-semibold text-[#0A2463] mb-2">Gợi ý tối ưu 💡</p>
                                            <ul className="text-sm text-[#5A6482] space-y-1">
                                                {q.suggestions.map((s, i) => <li key={i}>• {s}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {q.aiFeedback && (
                                        <p className="text-sm text-[#5A6482] italic">{q.aiFeedback}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate('/interview')}
                        className="flex-1 py-3 bg-[#F5C518] text-[#0A2463] font-bold rounded-xl hover:bg-[#D4A800] transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowRight className="w-5 h-5" />
                        Luyện tập lại
                    </button>
                    <button
                        onClick={() => navigate('/interview-history')}
                        className="flex-1 py-3 bg-[#0A2463] text-white font-semibold rounded-xl hover:bg-[#071A4A] transition-colors"
                    >
                        Xem lịch sử
                    </button>
                    <button
                        onClick={() => navigate('/interview-analytics')}
                        className="flex-1 py-3 border-2 border-[#0A2463] text-[#0A2463] font-semibold rounded-xl hover:bg-[#0A2463] hover:text-white transition-colors"
                    >
                        Phân tích chi tiết
                    </button>
                </div>
            </div>
        </SeekerLayout>
    );
}
