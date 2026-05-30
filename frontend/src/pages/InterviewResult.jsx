import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, RotateCcw, ArrowRight, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import SeekerLayout from '../components/layout/SeekerLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function InterviewResult() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedQuestions, setExpandedQuestions] = useState({});

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

    const toggleQuestion = (id) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const getRatingLabel = (score) => {
        if (score >= 80) return { text: 'Xuất sắc', color: 'text-green-600', bg: 'bg-green-100' };
        if (score >= 60) return { text: 'Tốt', color: 'text-amber-600', bg: 'bg-amber-100' };
        return { text: 'Cần cải thiện', color: 'text-red-600', bg: 'bg-red-100' };
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
    const performanceMetrics = [
        { label: 'Năng lực chuyên môn', value: Math.min(100, session.averageScore + 5) },
        { label: 'Phương pháp STAR', value: Math.min(100, session.averageScore - 5) },
        { label: 'Lãnh đạo & Hợp tác', value: Math.min(100, session.averageScore + 2) },
        { label: 'Kỹ năng giao tiếp', value: session.averageScore }
    ];

    return (
        <SeekerLayout title="Kết quả phỏng vấn" breadcrumb={`Phỏng vấn › ${session.jobTitle || 'Kết quả'}`}>
            <div className="max-w-5xl mx-auto w-full space-y-8">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-lg border border-[#DDE3F0] overflow-hidden">
                    <div className="bg-gradient-to-r from-[#0A2463] to-[#071A4A] text-white px-8 py-12">
                        <h1 className="text-4xl font-bold mb-2">{session.jobTitle} - Kết quả phỏng vấn</h1>
                        <p className="text-white/70">Phỏng vấn vào {new Date(session.completedAt).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>

                    {/* Score Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-[#F4F6FB]">
                        <div className="bg-white rounded-2xl p-6 border border-[#DDE3F0]">
                            <p className="text-sm text-[#5A6482] font-semibold mb-2">Điểm tổng quát</p>
                            <p className="text-5xl font-bold text-[#0A2463]">{session.averageScore}</p>
                            <p className="text-xs text-[#5A6482] mt-2">trên 100 điểm</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-[#DDE3F0]">
                            <p className="text-sm text-[#5A6482] font-semibold mb-2">Xếp hạng</p>
                            <p className={`text-3xl font-bold ${rating.color}`}>{rating.text}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-[#DDE3F0]">
                            <p className="text-sm text-[#5A6482] font-semibold mb-2">Thời gian</p>
                            <p className="text-3xl font-bold text-[#0A2463]">{Math.floor(session.duration / 60)}m</p>
                            <p className="text-xs text-[#5A6482] mt-2">{session.duration % 60}s</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-[#DDE3F0]">
                            <p className="text-sm text-[#5A6482] font-semibold mb-2">Câu hỏi</p>
                            <p className="text-3xl font-bold text-[#0A2463]">{session.answeredQuestions}</p>
                            <p className="text-xs text-[#5A6482] mt-2">trong {session.totalQuestions}</p>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics Breakdown */}
                <div className="bg-white rounded-3xl shadow-lg border border-[#DDE3F0] p-8">
                    <h2 className="text-2xl font-bold text-[#0A2463] mb-6 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-[#F5C518]" />
                        Phân tích Hiệu suất
                    </h2>
                    <div className="space-y-6">
                        {performanceMetrics.map((metric, idx) => (
                            <div key={idx}>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-semibold text-[#0A2463]">{metric.label}</p>
                                    <span className="text-lg font-bold text-[#0A2463]">{metric.value}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-[#0A2463] to-[#F5C518] h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${metric.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="bg-white rounded-3xl shadow-lg border border-[#DDE3F0] p-8">
                        <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                            <span className="text-2xl">✓</span>
                            Điểm Mạnh
                        </h3>
                        <ul className="space-y-3">
                            {(session.strengths || []).map((strength, i) => (
                                <li key={i} className="flex gap-3 items-start">
                                    <span className="text-green-600 font-bold mt-1">•</span>
                                    <span className="text-[#5A6482]">{strength}</span>
                                </li>
                            ))}
                            {(!session.strengths || session.strengths.length === 0) && (
                                <p className="text-[#5A6482] italic">Chưa có dữ liệu</p>
                            )}
                        </ul>
                    </div>

                    {/* Improvements */}
                    <div className="bg-white rounded-3xl shadow-lg border border-[#DDE3F0] p-8">
                        <h3 className="text-xl font-bold text-amber-700 mb-4 flex items-center gap-2">
                            <span className="text-2xl">→</span>
                            Cần Cải Thiện
                        </h3>
                        <ul className="space-y-3">
                            {(session.improvements || []).map((improvement, i) => (
                                <li key={i} className="flex gap-3 items-start">
                                    <span className="text-amber-600 font-bold mt-1">•</span>
                                    <span className="text-[#5A6482]">{improvement}</span>
                                </li>
                            ))}
                            {(!session.improvements || session.improvements.length === 0) && (
                                <p className="text-[#5A6482] italic">Chưa có dữ liệu</p>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Overall Feedback */}
                {session.overallFeedback && (
                    <div className="bg-gradient-to-r from-[#0A2463]/5 to-[#F5C518]/5 rounded-3xl border border-[#DDE3F0] p-8">
                        <h3 className="text-xl font-bold text-[#0A2463] mb-4">Nhận xét Chung</h3>
                        <p className="text-[#5A6482] leading-relaxed">{session.overallFeedback}</p>
                    </div>
                )}

                {/* Complete Transcript */}
                <div className="bg-white rounded-3xl shadow-lg border border-[#DDE3F0] overflow-hidden">
                    <div className="bg-[#F4F6FB] px-8 py-6 border-b border-[#DDE3F0]">
                        <h3 className="text-xl font-bold text-[#0A2463]">Transcript Hoàn Chỉnh</h3>
                    </div>
                    <div className="p-8 space-y-4">
                        {questions.length > 0 ? (
                            questions.map((q, index) => (
                                <div key={q._id} className="border border-[#DDE3F0] rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => toggleQuestion(q._id)}
                                        className="w-full p-6 flex items-center justify-between hover:bg-[#F4F6FB] transition-colors"
                                    >
                                        <div className="text-left flex-1">
                                            <p className="text-sm font-semibold text-[#5A6482] mb-1">Câu {index + 1}</p>
                                            <p className="font-semibold text-[#0A2463]">{q.questionText}</p>
                                        </div>
                                        <div className="flex items-center gap-4 ml-4">
                                            <span className="text-lg font-bold text-[#0A2463]">{q.aiScore}/100</span>
                                            {expandedQuestions[q._id] ? <ChevronUp className="w-5 h-5 text-[#0A2463]" /> : <ChevronDown className="w-5 h-5 text-[#0A2463]" />}
                                        </div>
                                    </button>

                                    {expandedQuestions[q._id] && (
                                        <div className="px-6 pb-6 space-y-4 bg-[#F4F6FB]">
                                            <div>
                                                <p className="text-xs font-bold text-[#5A6482] mb-2 uppercase">Câu trả lời của bạn</p>
                                                <p className="text-[#5A6482] bg-white rounded-lg p-4">{q.userAnswer}</p>
                                            </div>

                                            {q.keyPoints?.length > 0 && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <p className="text-xs font-bold text-green-700 mb-2">✓ Điểm đạt</p>
                                                    <ul className="space-y-1 text-sm text-[#5A6482]">
                                                        {q.keyPoints.map((p, i) => <li key={i}>• {p}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            {q.missedPoints?.length > 0 && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                                    <p className="text-xs font-bold text-amber-700 mb-2">→ Điểm thiếu</p>
                                                    <ul className="space-y-1 text-sm text-[#5A6482]">
                                                        {q.missedPoints.map((p, i) => <li key={i}>• {p}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            {q.aiFeedback && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <p className="text-xs font-bold text-blue-700 mb-2">💬 Nhận xét AI</p>
                                                    <p className="text-sm text-[#5A6482]">{q.aiFeedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-[#5A6482] text-center py-8">Chưa có dữ liệu câu hỏi</p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/interview')}
                        className="py-4 px-6 bg-gradient-to-r from-[#0A2463] to-[#071A4A] text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Luyện Tập Lại
                    </button>
                    <button
                        onClick={() => {/* Download logic */}}
                        className="py-4 px-6 bg-white border-2 border-[#0A2463] text-[#0A2463] font-bold rounded-2xl hover:bg-[#F4F6FB] transition-all flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Tải Xuống
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="py-4 px-6 bg-[#F5C518] text-[#0A2463] font-bold rounded-2xl hover:bg-[#D4A800] transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowRight className="w-5 h-5" />
                        Quay Lại
                    </button>
                </div>
            </div>
        </SeekerLayout>
    );
}
