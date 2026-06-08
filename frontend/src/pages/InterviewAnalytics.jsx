import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    BarChart3,
    TrendingUp,
    Target,
    Zap,
    Award,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import SeekerLayout from '../components/layout/SeekerLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function InterviewAnalytics() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${API_URL}/api/interview/analytics`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setAnalytics(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !analytics) {
        return (
            <SeekerLayout title="Phân tích phỏng vấn">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-500 ml-4">Đang tải...</p>
                </div>
            </SeekerLayout>
        );
    }

    const ScoreCard = ({ label, score, icon: Icon, highlight }) => (
        <div
            className={`rounded-2xl shadow-sm border p-6 ${
                highlight
                    ? 'bg-[#F5C518]/15 border-[#F5C518]/35 text-slate-800 shadow-md'
                    : 'bg-white/80 border border-slate-200/60 backdrop-blur-md text-slate-800 shadow-md'
            }`}
        >
            <div className="flex items-center justify-between mb-4">
                <p className={`text-sm font-semibold ${highlight ? 'text-slate-700' : 'text-slate-500'}`}>{label}</p>
                <Icon className={`w-6 h-6 ${highlight ? 'text-[#0A2463] font-bold' : 'text-[#0A2463]'}`} />
            </div>
            <div className="flex items-baseline gap-2">
                <p className={`font-heading text-4xl ${highlight ? 'text-[#0A2463] font-bold' : 'text-[#0A2463]'}`}>
                    {Math.round(score)}
                </p>
                <p className={highlight ? 'text-slate-500' : 'text-slate-550'}>/100</p>
            </div>
            <div className={`mt-4 w-full rounded-full h-2 ${highlight ? 'bg-slate-200' : 'bg-slate-100'}`}>
                <div
                    className={`h-2 rounded-full transition-all ${highlight ? 'bg-[#0A2463]' : 'bg-gradient-to-r from-[#0A2463] to-emerald-500'}`}
                    style={{ width: `${Math.min(100, score)}%` }}
                />
            </div>
        </div>
    );

    return (
        <SeekerLayout title="Phân tích phỏng vấn" breadcrumb="Phỏng vấn › Analytics">
            <div className="max-w-6xl mx-auto w-full">
                <p className="text-slate-500 mb-8 -mt-2">Theo dõi tiến độ luyện tập — mô hình HR Advisor</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Tổng phỏng vấn', value: analytics.totalInterviews, icon: BarChart3 },
                        { label: 'Hoàn tất', value: analytics.completedInterviews, icon: Award },
                        { label: 'Câu hỏi làm', value: analytics.totalQuestionsAnswered, icon: Zap },
                        { label: 'Cải thiện', value: `+${analytics.scoreImprovement.toFixed(1)}`, icon: TrendingUp },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-4 text-slate-800 shadow-md">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
                                <stat.icon className="w-4 h-4 text-slate-800" />
                            </div>
                            <p className="font-heading text-2xl text-slate-800">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <ScoreCard label="Điểm trung bình" score={analytics.averageScore} icon={Award} highlight />
                    <ScoreCard label="Câu hỏi kỹ thuật" score={analytics.technicalScore} icon={Zap} />
                    <ScoreCard label="Câu hỏi hành vi" score={analytics.behavioralScore} icon={Target} />
                </div>

                <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-8 text-slate-800 shadow-xl mb-8">
                    <h2 className="font-heading text-2xl text-slate-800 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6" />
                        Tiến trình điểm số theo lĩnh vực
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {Object.entries(analytics.categoryScores || {}).map(([category, score]) => (
                            <div key={category}>
                                <div className="flex justify-between mb-2">
                                    <p className="font-semibold text-slate-800">{category}</p>
                                    <p className="font-bold text-slate-800">{score.toFixed(0)}</p>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200">
                                    <div
                                        className="h-3 rounded-full bg-gradient-to-r from-[#0A2463] to-emerald-500 transition-all"
                                        style={{ width: `${score}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {analytics.strongestCategories?.length > 0 && (
                        <div className="bg-white/10 border border-white/10 border-l-4 border-l-emerald-400 backdrop-blur-md rounded-2xl p-8 text-slate-800">
                            <h3 className="font-heading text-xl text-slate-800 mb-4 flex items-center gap-2">
                                <Award className="w-6 h-6 text-emerald-600" />
                                Điểm mạnh
                            </h3>
                            <ul className="space-y-2">
                                {analytics.strongestCategories.map((cat, i) => (
                                    <li key={i} className="flex items-center gap-2 text-slate-800/60">
                                        <span className="text-emerald-600">✓</span>
                                        <span className="font-medium">{cat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {analytics.weakestCategories?.length > 0 && (
                        <div className="bg-white/10 border border-white/10 border-l-4 border-l-[#F5C518] backdrop-blur-md rounded-2xl p-8 text-slate-800">
                            <h3 className="font-heading text-xl text-slate-800 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-6 h-6 text-[#F5C518] font-bold font-bold" />
                                Cần cải thiện
                            </h3>
                            <ul className="space-y-2">
                                {analytics.weakestCategories.map((cat, i) => (
                                    <li key={i} className="flex items-center gap-2 text-slate-800/60">
                                        <span className="text-slate-800">→</span>
                                        <span className="font-medium">{cat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {analytics.aiRecommendations?.length > 0 && (
                    <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-8 text-slate-800 shadow-xl mb-8">
                        <h2 className="font-heading text-2xl text-slate-800 mb-6">Gợi ý từ AI</h2>
                        <div className="space-y-4">
                            {analytics.aiRecommendations.map((rec, i) => (
                                <div
                                    key={i}
                                    className={`p-4 rounded-xl border-l-4 ${
                                        rec.priority === 'high'
                                            ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                                            : rec.priority === 'medium'
                                            ? 'bg-[#F5C518]/10 border border-[#F5C518]/20 text-[#F5C518] font-bold'
                                            : 'bg-white/5 border border-white/10 text-slate-800/80'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="font-semibold text-slate-800">{rec.category}</p>
                                        <span className="text-xs font-semibold text-slate-500">
                                            {rec.priority === 'high' ? 'Cao' : rec.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                        </span>
                                    </div>
                                    <p className="text-slate-800/60 text-sm">{rec.recommendation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {analytics.firstInterviewDate && (
                    <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-8 text-slate-800 mb-8 shadow-xl">
                        <h2 className="font-heading text-xl mb-4">Thống kê thời gian</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-slate-800/60 text-sm mb-1">Lần đầu</p>
                                <p className="font-bold">{new Date(analytics.firstInterviewDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div>
                                <p className="text-slate-800/60 text-sm mb-1">Lần cuối</p>
                                <p className="font-bold">
                                    {analytics.lastInterviewDate
                                        ? new Date(analytics.lastInterviewDate).toLocaleDateString('vi-VN')
                                        : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-800/60 text-sm mb-1">Thời gian TB / câu</p>
                                <p className="font-bold text-[#0A2463] font-bold font-bold">{Math.round(analytics.averageResponseTime)}s</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-center">
                    <button
                        onClick={() => navigate('/interview')}
                        className="px-8 py-3 bg-[#F5C518] text-slate-800 font-bold rounded-lg hover:bg-[#D4A800] transition-colors"
                    >
                        Luyện tập thêm
                    </button>
                </div>
            </div>

        </SeekerLayout>
    );
}
