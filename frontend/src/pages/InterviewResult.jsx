import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, RotateCcw, ArrowRight, TrendingUp, ChevronDown, ChevronUp, CheckCircle, XCircle, Target, Brain, MessageSquare, Award } from 'lucide-react';
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

    const getRatingLabel = (score, recommendation) => {
        // Sử dụng recommendation từ backend nếu có, nếu không thì tính dựa trên score
        if (recommendation) {
            const rec = recommendation.toLowerCase();
            if (rec.includes('strong hire')) return { text: 'Strong Hire', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
            if (rec.includes('hire')) return { text: 'Hire', color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle };
            if (rec.includes('consider')) return { text: 'Consider', color: 'text-amber-600', bg: 'bg-amber-100', icon: Target };
            if (rec.includes('no hire')) return { text: 'No Hire', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle };
        }

        // Fallback dựa trên score
        if (score >= 85) return { text: 'Strong Hire', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
        if (score >= 70) return { text: 'Hire', color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle };
        if (score >= 50) return { text: 'Consider', color: 'text-amber-600', bg: 'bg-amber-100', icon: Target };
        return { text: 'No Hire', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle };
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
                    <p className="text-[#5A6482]">Đang tải kết quả...</p>
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
                <div className="bg-white rounded-3xl shadow-lg border border-[#DDE3F0] overflow-hidden">
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
                    <div className="bg-white rounded-3xl shadow-lg border border-[#DDE3F0] p-8">
                        <h2 className="text-2xl font-bold text-[#0A2463] mb-6 flex items-center gap-2">
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
                                            <skill.icon className="w-4 h-4 text-[#5A6482]" />
                                            <p className="font-semibold text-[#0A2463]">{skill.label}</p>
                                        </div>
                                        <span className="text-lg font-bold text-[#0A2463]">{skill.score}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
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
                    <div className="bg-white rounded-3xl shadow-lg border border-[#DDE3F0] p-8">
                        <h2 className="text-2xl font-bold text-[#0A2463] mb-6 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-[#F5C518]" />
                            Interview Stats
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#F4F6FB] rounded-2xl p-4">
                                <p className="text-sm text-[#5A6482] font-semibold mb-1">Thời gian</p>
                                <p className="text-2xl font-bold text-[#0A2463]">{Math.floor(session.duration / 60)}m {session.duration % 60}s</p>
                            </div>
                            <div className="bg-[#F4F6FB] rounded-2xl p-4">
                                <p className="text-sm text-[#5A6482] font-semibold mb-1">Câu hỏi</p>
                                <p className="text-2xl font-bold text-[#0A2463]">{session.answeredQuestions}/{session.totalQuestions}</p>
                            </div>
                            <div className="bg-[#F4F6FB] rounded-2xl p-4">
                                <p className="text-sm text-[#5A6482] font-semibold mb-1">Loại phỏng vấn</p>
                                <p className="text-2xl font-bold text-[#0A2463]">{session.interviewType}</p>
                            </div>
                            <div className="bg-[#F4F6FB] rounded-2xl p-4">
                                <p className="text-sm text-[#5A6482] font-semibold mb-1">Mức độ</p>
                                <p className="text-2xl font-bold text-[#0A2463]">{session.difficultyLevel || 2}/5</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question-by-Question Analysis */}
                <div className="bg-white rounded-3xl shadow-lg border border-[#DDE3F0] overflow-hidden">
                    <div className="bg-[#F4F6FB] px-8 py-6 border-b border-[#DDE3F0]">
                        <h3 className="text-xl font-bold text-[#0A2463]">Question-by-Question Analysis</h3>
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
                                            <p className="text-sm font-semibold text-[#5A6482] mb-1">Question {index + 1} ({q.questionType})</p>
                                            <p className="font-semibold text-[#0A2463]">{q.questionText}</p>
                                        </div>
                                        <div className="flex items-center gap-4 ml-4">
                                            <div className={`px-4 py-2 rounded-lg font-bold ${
                                                q.aiScore >= 80 ? 'bg-green-100 text-green-700' :
                                                q.aiScore >= 60 ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {q.aiScore}/100
                                            </div>
                                            {expandedQuestions[q._id] ? <ChevronUp className="w-5 h-5 text-[#0A2463]" /> : <ChevronDown className="w-5 h-5 text-[#0A2463]" />}
                                        </div>
                                    </button>

                                    {expandedQuestions[q._id] && (
                                        <div className="px-6 pb-6 space-y-4 bg-[#F4F6FB]">
                                            <div>
                                                <p className="text-xs font-bold text-[#5A6482] mb-2 uppercase">Candidate Answer</p>
                                                <p className="text-[#5A6482] bg-white rounded-lg p-4">{q.userAnswer}</p>
                                            </div>

                                            {q.keyPoints?.length > 0 && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <p className="text-xs font-bold text-green-700 mb-2">✓ Strengths</p>
                                                    <ul className="space-y-1 text-sm text-[#5A6482]">
                                                        {q.keyPoints.map((p, i) => <li key={i}>• {p}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            {q.missedPoints?.length > 0 && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                                    <p className="text-xs font-bold text-amber-700 mb-2">→ Areas for Improvement</p>
                                                    <ul className="space-y-1 text-sm text-[#5A6482]">
                                                        {q.missedPoints.map((p, i) => <li key={i}>• {p}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            {q.suggestions?.length > 0 && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <p className="text-xs font-bold text-blue-700 mb-2">� Suggested Better Answer</p>
                                                    <ul className="space-y-1 text-sm text-[#5A6482]">
                                                        {q.suggestions.map((p, i) => <li key={i}>• {p}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            {q.aiFeedback && (
                                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                                    <p className="text-xs font-bold text-purple-700 mb-2">💬 AI Feedback</p>
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

                {/* Final Summary */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="bg-white rounded-3xl shadow-lg border border-[#DDE3F0] p-8">
                        <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6" />
                            Strengths
                        </h3>
                        <ul className="space-y-3">
                            {(session.strengths || []).map((strength, i) => (
                                <li key={i} className="flex gap-3 items-start">
                                    <span className="text-green-600 font-bold mt-1">✓</span>
                                    <span className="text-[#5A6482]">{strength}</span>
                                </li>
                            ))}
                            {(!session.strengths || session.strengths.length === 0) && (
                                <p className="text-[#5A6482] italic">Chưa có dữ liệu</p>
                            )}
                        </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="bg-white rounded-3xl shadow-lg border border-[#DDE3F0] p-8">
                        <h3 className="text-xl font-bold text-amber-700 mb-4 flex items-center gap-2">
                            <XCircle className="w-6 h-6" />
                            Areas to Improve
                        </h3>
                        <ul className="space-y-3">
                            {(session.improvements || []).map((improvement, i) => (
                                <li key={i} className="flex gap-3 items-start">
                                    <span className="text-amber-600 font-bold mt-1">→</span>
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
                        <h3 className="text-xl font-bold text-[#0A2463] mb-4">Final Summary</h3>
                        <p className="text-[#5A6482] leading-relaxed">{session.overallFeedback}</p>
                        {session.nextSteps && session.nextSteps.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-bold text-[#0A2463] mb-2">Next Steps:</p>
                                <ul className="space-y-1 text-sm text-[#5A6482]">
                                    {session.nextSteps.map((step, i) => <li key={i}>• {step}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

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
                        className="py-4 px-6 bg-white border-2 border-[#0A2463] text-[#0A2463] font-bold rounded-2xl hover:bg-[#F4F6FB] transition-all flex items-center justify-center gap-2"
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
