import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Briefcase, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import SeekerLayout from '../components/layout/SeekerLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const FILTER_TABS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'completed', label: 'Hoàn tất' },
    { id: 'ongoing', label: 'Đang làm' },
    { id: 'paused', label: 'Tạm dừng' },
];

const accentColor = (status) => {
    switch (status) {
        case 'completed': return 'bg-[#22C55E]';
        case 'ongoing': return 'bg-[#F5C518]';
        case 'paused': return 'bg-[#94A3B8]';
        default: return 'bg-[#94A3B8]';
    }
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        case 'ongoing': return 'bg-[#F5C518]/20 text-[#0A2463] border border-[#F5C518]/30';
        case 'paused': return 'bg-slate-100 text-slate-600 border border-slate-200';
        default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'completed': return 'Hoàn tất';
        case 'ongoing': return 'Đang làm';
        case 'paused': return 'Tạm dừng';
        default: return 'Không xác định';
    }
};

export default function InterviewHistory() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchInterviewHistory();
    }, [filter]);

    const fetchInterviewHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${API_URL}/api/interview/history?limit=20`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                let filtered = response.data.data;
                if (filter !== 'all') {
                    filtered = filtered.filter((s) => s.status === filter);
                }
                setSessions(filtered);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SeekerLayout title="Lịch sử phỏng vấn" breadcrumb="Phỏng vấn › Lịch sử">
            <div className="max-w-5xl mx-auto w-full">
                <p className="text-slate-800 mb-6 -mt-2">Xem các phiên phỏng vấn trước đây của bạn</p>

                <div className="inline-flex bg-slate-200/50 rounded-xl p-1 shadow-sm border border-slate-300/60 mb-8 flex-wrap gap-1">
                    {FILTER_TABS.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => setFilter(id)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                filter === id
                                    ? 'bg-[#F5C518] text-[#0A2463] font-bold shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/40'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin text-[#0A2463] mx-auto mb-4" />
                        <p className="text-slate-900">Đang tải lịch sử...</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-12">
                        <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-900 mb-4">Chưa có phiên phỏng vấn nào</p>
                        <button
                            onClick={() => navigate('/interview')}
                            className="px-6 py-3 bg-[#F5C518] text-[#0A2463] font-bold rounded-lg hover:bg-[#D4A800] transition-colors"
                        >
                            Bắt đầu phỏng vấn đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <button
                                key={session._id}
                                onClick={() =>
                                    session.status === 'completed'
                                        ? navigate(`/interview/${session._id}/result`)
                                        : navigate(`/interview/${session._id}`)
                                }
                                className="group w-full flex bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl hover:bg-white hover:border-[#F5C518]/30 overflow-hidden text-left text-slate-800 shadow-md transition-all"
                            >
                                <div className={`w-1 flex-shrink-0 ${accentColor(session.status)}`} />

                                <div className="flex-1 p-6 flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Briefcase className="w-5 h-5 text-[#0A2463]" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{session.jobTitle}</p>
                                                <span className="inline-block mt-1 bg-[#F5C518]/25 text-[#0A2463] border border-[#F5C518]/30 rounded-full font-semibold px-3 py-0.5 text-xs font-semibold">
                                                    {session.jobCategory}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-6 flex-wrap mb-3">
                                            <div>
                                                <p className="text-xs text-slate-500">Thời gian</p>
                                                <p className="font-bold text-slate-800 text-sm">
                                                    {Math.floor(session.duration / 60)}m {session.duration % 60}s
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Câu hỏi</p>
                                                <p className="font-bold text-slate-800 text-sm">
                                                    {session.answeredQuestions}/{session.totalQuestions}
                                                </p>
                                            </div>
                                            {session.status === 'completed' && (
                                                <div>
                                                    <p className="text-xs text-slate-500">Điểm</p>
                                                    <p className="font-bold text-slate-800 text-sm">{session.averageScore}/100</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(session.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(session.status)}`}>
                                            {getStatusLabel(session.status)}
                                        </span>

                                        {session.status === 'completed' && (
                                            <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                <span className="text-xl font-bold text-[#F5C518]">{session.averageScore}</span>
                                            </div>
                                        )}

                                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/interview')}
                        className="px-8 py-3 bg-[#F5C518] text-[#0A2463] font-bold rounded-lg hover:bg-[#D4A800] shadow-md transition-colors inline-flex items-center gap-2"
                    >
                        <TrendingUp className="w-5 h-5" />
                        Luyện tập thêm
                    </button>
                </div>
            </div>
        </SeekerLayout>
    );
}
