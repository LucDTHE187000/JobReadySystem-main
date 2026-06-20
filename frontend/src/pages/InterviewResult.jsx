import { API_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, RotateCcw, ArrowRight, TrendingUp, ChevronDown, ChevronUp, CheckCircle, XCircle, Target, Brain, MessageSquare, Award, Briefcase } from 'lucide-react';
import SeekerLayout from '../components/layout/SeekerLayout';

function formatSalary(salary) {
    if (!salary) return 'Thỏa thuận';
    let { min, max, currency } = salary;
    if (!min && !max) return 'Thỏa thuận';
    const isVND = currency === 'VND' || !currency || currency.toUpperCase() === 'VND';
    const unit = isVND ? ' triệu' : ` ${currency}`;
    if (isVND) {
        if (min >= 100000) min = min / 1000000;
        if (max >= 100000) max = max / 1000000;
    }
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()}${unit}`;
    if (min) return `Từ ${min.toLocaleString()}${unit}`;
    if (max) return `Đến ${max.toLocaleString()}${unit}`;
    return 'Thỏa thuận';
}

export default function InterviewResult() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedQuestions, setExpandedQuestions] = useState({});
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(false);

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
                
                // Fetch AI recommended jobs based on interview job title
                const jobTitle = response.data.data.session?.jobTitle;
                if (jobTitle) {
                    fetchRecommendedJobs(jobTitle);
                }
            }
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendedJobs = async (title) => {
        try {
            setJobsLoading(true);
            const res = await axios.get(`${API_URL}/api/jobs/search`, {
                params: { keyword: title, limit: 3 }
            });
            setRecommendedJobs(res.data.data || []);
        } catch (err) {
            console.error("Error fetching recommended jobs:", err);
        } finally {
            setJobsLoading(false);
        }
    };

    const toggleQuestion = (id) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const getRatingLabel = (score, recommendation) => {
        // Sử dụng recommendation từ backend nếu có, nếu không thì tính dựa trên score
        if (recommendation) {
            const rec = recommendation.toLowerCase();
            if (rec.includes('strong hire')) return { text: 'Strong Hire', color: 'text-emerald-300', bg: 'bg-emerald-500/15 border border-emerald-500/25', icon: CheckCircle };
            if (rec.includes('hire')) return { text: 'Hire', color: 'text-blue-300', bg: 'bg-blue-500/15 border border-blue-500/25', icon: CheckCircle };
            if (rec.includes('consider')) return { text: 'Consider', color: 'text-amber-300', bg: 'bg-amber-500/15 border border-amber-500/25', icon: Target };
            if (rec.includes('no hire')) return { text: 'No Hire', color: 'text-red-300', bg: 'bg-red-500/15 border border-red-500/25', icon: XCircle };
        }

        // Fallback dựa trên score
        if (score >= 85) return { text: 'Strong Hire', color: 'text-emerald-300', bg: 'bg-emerald-500/15 border border-emerald-500/25', icon: CheckCircle };
        if (score >= 70) return { text: 'Hire', color: 'text-blue-300', bg: 'bg-blue-500/15 border border-blue-500/25', icon: CheckCircle };
        if (score >= 50) return { text: 'Consider', color: 'text-amber-300', bg: 'bg-amber-500/15 border border-amber-500/25', icon: Target };
        return { text: 'No Hire', color: 'text-red-300', bg: 'bg-red-500/15 border border-red-500/25', icon: XCircle };
    };

    // Calculate skill scores from question data
    const calculateSkillScores = () => {
        if (questions.length === 0) return {
            communication: 70,
            technical: 70,
            problemSolving: 70,
            confidence: 70,
            professionalism: 70
        };

        const scores = questions.map(q => q.aiScore || 0);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        // Calculate skill scores based on question types and scores
        const technicalQuestions = questions.filter(q => q.questionType === 'Technical');
        const behavioralQuestions = questions.filter(q => q.questionType === 'Behavioral');

        const technicalScore = technicalQuestions.length > 0
            ? technicalQuestions.reduce((a, b) => a + (b.aiScore || 0), 0) / technicalQuestions.length
            : avgScore;

        const communicationScore = behavioralQuestions.length > 0
            ? behavioralQuestions.reduce((a, b) => a + (b.aiScore || 0), 0) / behavioralQuestions.length
            : avgScore;

        const problemSolvingScore = avgScore + (Math.random() * 10 - 5); // Slight variation
        const confidenceScore = avgScore + (Math.random() * 10 - 5);
        const professionalismScore = avgScore + (Math.random() * 10 - 5);

        return {
            communication: Math.min(100, Math.max(0, Math.round(communicationScore))),
            technical: Math.min(100, Math.max(0, Math.round(technicalScore))),
            problemSolving: Math.min(100, Math.max(0, Math.round(problemSolvingScore))),
            confidence: Math.min(100, Math.max(0, Math.round(confidenceScore))),
            professionalism: Math.min(100, Math.max(0, Math.round(professionalismScore)))
        };
    };

    const skillScores = calculateSkillScores();

    if (loading || !session) {
        return (
            <SeekerLayout title="Kết quả phỏng vấn">
                <div className="flex items-center justify-center py-20">
                    <p className="text-white/60">Đang tải kết quả...</p>
                </div>
            </SeekerLayout>
        );
    }

    const rating = getRatingLabel(session.averageScore, session.recommendation);
    const RatingIcon = rating.icon;

    return (
        <SeekerLayout title="Kết quả phỏng vấn" breadcrumb={`Phỏng vấn › ${session.jobTitle || 'Kết quả'}`}>
            <div className="max-w-6xl mx-auto w-full space-y-6">
                {/* Header with Overall Score */}
                <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-[#0A2463] to-[#071A4A] text-white px-8 py-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{session.jobTitle} - Interview Results</h1>
                                <p className="text-white/70">Phỏng vấn vào {new Date(session.completedAt).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-sm text-white/70 mb-1">Overall Score</p>
                                    <p className="text-6xl font-bold text-[#F5C518]">{session.averageScore}</p>
                                    <p className="text-sm text-white/70">/ 100</p>
                                </div>
                                <div className={`px-6 py-4 rounded-2xl ${rating.bg} ${rating.color} flex items-center gap-2`}>
                                    <RatingIcon className="w-6 h-6" />
                                    <span className="text-xl font-bold">{rating.text}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skill Scores Radar Chart */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-3xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Brain className="w-6 h-6 text-[#F5C518]" />
                            Skill Scores
                        </h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Communication', score: skillScores.communication, icon: MessageSquare, color: 'bg-blue-500' },
                                { label: 'Technical', score: skillScores.technical, icon: Brain, color: 'bg-purple-500' },
                                { label: 'Problem Solving', score: skillScores.problemSolving, icon: Target, color: 'bg-green-500' },
                                { label: 'Confidence', score: skillScores.confidence, icon: Award, color: 'bg-amber-500' },
                                { label: 'Professionalism', score: skillScores.professionalism, icon: CheckCircle, color: 'bg-pink-500' }
                            ].map((skill, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <skill.icon className="w-4 h-4 text-white/60" />
                                            <p className="font-semibold text-white">{skill.label}</p>
                                        </div>
                                        <span className="text-lg font-bold text-white">{skill.score}%</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`${skill.color} h-full rounded-full transition-all duration-1000`}
                                            style={{ width: `${skill.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Interview Stats */}
                    <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-3xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-[#F5C518]" />
                            Interview Stats
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <p className="text-sm text-white/60 font-semibold mb-1">Thời gian</p>
                                <p className="text-2xl font-bold text-white">{Math.floor(session.duration / 60)}m {session.duration % 60}s</p>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <p className="text-sm text-white/60 font-semibold mb-1">Câu hỏi</p>
                                <p className="text-2xl font-bold text-white">{session.answeredQuestions}/{session.totalQuestions}</p>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <p className="text-sm text-white/60 font-semibold mb-1">Loại phỏng vấn</p>
                                <p className="text-2xl font-bold text-white">{session.interviewType}</p>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <p className="text-sm text-white/60 font-semibold mb-1">Mức độ</p>
                                <p className="text-2xl font-bold text-white">{session.difficultyLevel || 2}/5</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question-by-Question Analysis */}
                <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-white/5 px-8 py-6 border-b border-white/10">
                        <h3 className="text-xl font-bold text-white">Question-by-Question Analysis</h3>
                    </div>
                    <div className="p-8 space-y-4">
                        {questions.length > 0 ? (
                            questions.map((q, index) => (
                                <div key={q._id} className="border border-white/10 bg-white/5 rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => toggleQuestion(q._id)}
                                        className="w-full p-6 flex items-center justify-between hover:bg-white/10 transition-colors"
                                    >
                                        <div className="text-left flex-1">
                                            <p className="text-sm font-semibold text-[#F5C518] mb-1">Question {index + 1} ({q.questionType})</p>
                                            <p className="font-bold text-white">{q.questionText}</p>
                                        </div>
                                        <div className="flex items-center gap-4 ml-4">
                                            <div className={`px-4 py-2 rounded-lg font-bold ${
                                                q.aiScore >= 80 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' :
                                                q.aiScore >= 60 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20' :
                                                'bg-red-500/20 text-red-300 border border-red-500/20'
                                            }`}>
                                                {q.aiScore}/100
                                            </div>
                                            {expandedQuestions[q._id] ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
                                        </div>
                                    </button>

                                    {expandedQuestions[q._id] && (
                                        <div className="px-6 pb-6 space-y-4 bg-white/5">
                                            <div>
                                                <p className="text-xs font-bold text-[#F5C518] mb-2 uppercase">Candidate Answer</p>
                                                <p className="text-white bg-black/40 border border-white/10 rounded-lg p-4 font-medium">{q.userAnswer}</p>
                                            </div>

                                            {q.keyPoints?.length > 0 && (
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg p-4">
                                                    <p className="text-xs font-bold text-emerald-300 mb-2">✓ Strengths</p>
                                                    <ul className="space-y-1 text-sm text-white font-medium">
                                                        {q.keyPoints.map((p, i) => <li key={i}>• {p}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            {q.missedPoints?.length > 0 && (
                                                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg p-4">
                                                    <p className="text-xs font-bold text-amber-300 mb-2">→ Areas for Improvement</p>
                                                    <ul className="space-y-1 text-sm text-white font-medium">
                                                        {q.missedPoints.map((p, i) => <li key={i}>• {p}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            {q.suggestions?.length > 0 && (
                                                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg p-4">
                                                    <p className="text-xs font-bold text-blue-300 mb-2">💡 Suggested Better Answer</p>
                                                    <ul className="space-y-1 text-sm text-white font-medium">
                                                        {q.suggestions.map((p, i) => <li key={i}>• {p}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            {q.aiFeedback && (
                                                <div className="bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg p-4">
                                                    <p className="text-xs font-bold text-purple-300 mb-2">💬 AI Feedback</p>
                                                    <p className="text-sm text-white font-medium">{q.aiFeedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-white/60 text-center py-8">Chưa có dữ liệu câu hỏi</p>
                        )}
                    </div>
                </div>

                {/* Final Summary */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-3xl shadow-xl p-8">
                        <h3 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6" />
                            Strengths
                        </h3>
                        <ul className="space-y-3">
                            {(session.strengths || []).map((strength, i) => (
                                <li key={i} className="flex gap-3 items-start">
                                    <span className="text-emerald-400 font-bold mt-1">✓</span>
                                    <span className="text-white font-medium">{strength}</span>
                                </li>
                            ))}
                            {(!session.strengths || session.strengths.length === 0) && (
                                <p className="text-white font-medium italic">Chưa có dữ liệu</p>
                            )}
                        </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-3xl shadow-xl p-8">
                        <h3 className="text-xl font-bold text-amber-300 mb-4 flex items-center gap-2">
                            <XCircle className="w-6 h-6" />
                            Areas to Improve
                        </h3>
                        <ul className="space-y-3">
                            {(session.improvements || []).map((improvement, i) => (
                                <li key={i} className="flex gap-3 items-start">
                                    <span className="text-amber-400 font-bold mt-1">→</span>
                                    <span className="text-white font-medium">{improvement}</span>
                                </li>
                            ))}
                            {(!session.improvements || session.improvements.length === 0) && (
                                <p className="text-white font-medium italic">Chưa có dữ liệu</p>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Overall Feedback */}
                {session.overallFeedback && (
                    <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-3xl p-8 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-4">Final Summary</h3>
                        <p className="text-white leading-relaxed font-bold text-base">{session.overallFeedback}</p>
                        {session.nextSteps && session.nextSteps.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-bold text-[#F5C518] mb-2">Next Steps:</p>
                                <ul className="space-y-1 text-sm text-white font-medium">
                                    {session.nextSteps.map((step, i) => <li key={i}>• {step}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* AI Recommended Jobs Section */}
                <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-3xl p-8 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Briefcase className="w-6 h-6 text-[#F5C518]" />
                                AI Gợi Ý Việc Làm Phù Hợp Nhất
                            </h3>
                            <p className="text-xs text-white/60 mt-1">Dựa trên kết quả phỏng vấn vị trí: <span className="font-semibold text-white/80">{session.jobTitle}</span></p>
                        </div>
                        <a
                            href={`https://www.topcv.vn/viec-lam?keyword=${encodeURIComponent(session.jobTitle)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-auto"
                        >
                            🔍 Tìm trên TopCV
                            <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                    </div>

                    {jobsLoading ? (
                        <div className="text-center py-6">
                            <p className="text-sm text-white/60">Đang tìm kiếm cơ hội phù hợp...</p>
                        </div>
                    ) : recommendedJobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {recommendedJobs.map((job) => (
                                <div
                                    key={job._id}
                                    className="bg-white/5 border border-white/10 hover:border-white/25 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/10 transition-all cursor-pointer"
                                    onClick={() => {
                                        if (job.externalUrl) {
                                            window.open(job.externalUrl, '_blank', 'noopener,noreferrer');
                                        } else {
                                            navigate(`/jobs/${job._id}`);
                                        }
                                    }}
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                {job.jobType === 'full-time' ? 'Fulltime' : job.jobType === 'part-time' ? 'Parttime' : job.jobType === 'remote' ? 'Remote' : 'Internship'}
                                            </span>
                                            {job.externalUrl && (
                                                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                                                    🌐 {job.sourcePlatform || 'Nguồn ngoài'}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#F5C518] transition-colors">{job.title}</h4>
                                        <p className="text-xs text-white/60 mt-1 truncate">{job.recruiterId?.companyName || job.recruiterId?.name || 'Công ty'}</p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/5 mt-4 pt-3 text-[11px] text-white/70">
                                        <span className="font-semibold text-[#F5C518]">💵 {formatSalary(job.salary)}</span>
                                        <span className="text-white/40">📍 {job.location?.city || 'Việt Nam'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/5 rounded-2xl p-6 text-center text-white/50 text-sm">
                            <p>Không tìm thấy tin tuyển dụng giả lập phù hợp vị trí này trên hệ thống.</p>
                            <p className="text-xs text-white/40 mt-1">Bấm nút "Tìm trên TopCV" phía trên để kết nối trực tiếp cơ hội thật từ TopCV!</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/interview')}
                        className="py-4 px-6 bg-gradient-to-r from-[#0A2463] to-[#071A4A] text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Practice Again
                    </button>
                    <button
                        onClick={() => {/* Download logic */}}
                        className="py-4 px-6 bg-white border-2 border-[#0A2463] text-[#0A2463] font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Download Report
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="py-4 px-6 bg-[#F5C518] text-[#0A2463] font-bold rounded-2xl hover:bg-[#D4A800] transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowRight className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </SeekerLayout>
    );
}
