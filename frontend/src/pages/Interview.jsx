import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Send, Loader2, ChevronRight, Volume2, BookOpen } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Interview() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const position = searchParams.get('position');
    const level = searchParams.get('level');

    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [questionIndex, setQuestionIndex] = useState(1);
    const [startTime, setStartTime] = useState(Date.now());

    // Data để lưu cho result page
    const [sessionData, setSessionData] = useState({
        position,
        level,
        questions: [],
        answers: [],
        scores: [],
        feedbacks: []
    });

    useEffect(() => {
        if (!position || !level) {
            navigate('/select-position');
            return;
        }
        fetchNextQuestion();
    }, [position, level]);

    const fetchNextQuestion = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${API_URL}/api/interview/question`,
                { position, level },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setCurrentQuestion(response.data.data);
                setUserAnswer('');
                setStartTime(Date.now());
            }
        } catch (error) {
            console.error('Error fetching question:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async (e) => {
        e.preventDefault();
        if (!userAnswer.trim()) return;

        try {
            setSubmitting(true);
            const responseTime = Math.floor((Date.now() - startTime) / 1000);

            // Gọi API evaluate
            const response = await axios.post(
                `${API_URL}/api/interview/evaluate`,
                {
                    question: currentQuestion.question,
                    answer: userAnswer
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const evaluation = response.data.data;

                // Lưu data vào session
                setSessionData(prev => ({
                    ...prev,
                    questions: [...prev.questions, currentQuestion.question],
                    answers: [...prev.answers, userAnswer],
                    scores: [...prev.scores, evaluation.score],
                    feedbacks: [...prev.feedbacks, evaluation]
                }));

                // Nếu đã hỏi đủ 5 câu, chuyển sang result
                if (questionIndex >= 5) {
                    // Lưu vào localStorage để result page lấy
                    localStorage.setItem('interviewSession', JSON.stringify({
                        ...sessionData,
                        questions: [...sessionData.questions, currentQuestion.question],
                        answers: [...sessionData.answers, userAnswer],
                        scores: [...sessionData.scores, evaluation.score],
                        feedbacks: [...sessionData.feedbacks, evaluation]
                    }));
                    navigate('/result');
                    return;
                }

                // Nếu chưa đủ, load câu tiếp theo
                setQuestionIndex(prev => prev + 1);
                await fetchNextQuestion();
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!position || !level) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mx-auto mb-4" />
                        <p className="text-gray-600">Đang sinh câu hỏi...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex flex-col">
            <Header />

            <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Câu {questionIndex}/5
                        </h1>
                        <span className="text-sm font-semibold px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full">
                            {position} • {level}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-cyan-500 h-2 rounded-full transition-all"
                            style={{ width: `${(questionIndex / 5) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Question Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                            {/* Question */}
                            <div className="mb-8">
                                <p className="text-sm text-gray-500 font-semibold mb-3">PHỎNG VẤN AI</p>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    {currentQuestion?.question}
                                </h2>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    Trả lời rõ ràng, chi tiết, và chân thực
                                </p>
                            </div>

                            {/* Answer Input */}
                            <form onSubmit={handleSubmitAnswer} className="space-y-4">
                                <textarea
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Nhập câu trả lời của bạn ở đây..."
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none"
                                />

                                <button
                                    type="submit"
                                    disabled={submitting || !userAnswer.trim()}
                                    className="w-full py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            AI đang chấm...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Gửi câu trả lời
                                        </>
                                    )}
                                </button>

                                {questionIndex < 5 && (
                                    <p className="text-xs text-gray-500 text-center">
                                        Sau khi gửi, AI sẽ chấm điểm và hỏi câu tiếp theo
                                    </p>
                                )}
                                {questionIndex === 5 && (
                                    <p className="text-xs text-cyan-600 text-center font-semibold">
                                        ⭐ Đây là câu cuối cùng! Sau khi gửi sẽ xem kết quả.
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Tips */}
                        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
                            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                <Volume2 className="w-5 h-5" />
                                💡 Lời khuyên
                            </h3>
                            <ul className="text-sm text-blue-900 space-y-2">
                                <li>• Nói rõ ràng, tự tin</li>
                                <li>• Có cấu trúc logic</li>
                                <li>• Kể ví dụ thực tế</li>
                                <li>• Liên hệ với công việc</li>
                            </ul>
                        </div>

                        {/* Question Info */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-2 font-semibold">VỊ TRÍ & LEVEL</p>
                            <p className="font-semibold text-gray-900 mb-3">{position}</p>
                            <p className="text-sm text-gray-700">
                                <strong>Level:</strong> {level}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
