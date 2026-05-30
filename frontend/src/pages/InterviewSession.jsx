import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, Loader2, Mic, MicOff, Video, PhoneOff, Bot, User, AlertCircle, Mic2 } from 'lucide-react';
import SeekerLayout from '../components/layout/SeekerLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOTAL_QUESTIONS = 5;

export default function InterviewSession() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const chatEndRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const recognitionRef = useRef(null);

    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [currentQuestionId, setCurrentQuestionId] = useState(null);
    const [totalQuestions, setTotalQuestions] = useState(5);
    const [timeLeft, setTimeLeft] = useState(10 * 60);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [cameraError, setCameraError] = useState(null);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        initSession();
        setupCamera();
        setupSpeechRecognition();
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [sessionId]);

    const setupCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: true
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraError(null);
        } catch (error) {
            console.error('Camera access error:', error);
            setCameraError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
        }
    };

    const setupSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            if (transcript.trim()) {
                setUserAnswer(prev => prev ? prev + ' ' + transcript : transcript);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    };

    const startListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const toggleMic = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
        }
        setMicOn(!micOn);
    };

    const toggleCamera = () => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
        }
        setCamOn(!camOn);
    };

    const initSession = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/interview/${sessionId}/details`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const s = res.data.data?.session || res.data.data;
            setSession(s);
            setTotalQuestions(s?.totalQuestions || 5);
            setMessages([
                {
                    role: 'ai',
                    text: `Xin chào! Tôi là AI phỏng vấn JobReady. Hôm nay chúng ta sẽ luyện tập vị trí **${s?.jobTitle || ''}**. Hãy trả lời tự tin và rõ ràng nhé!`,
                },
            ]);
            await fetchQuestion(s, true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestion = async (activeSession = session, isFirst = false) => {
        try {
            const res = await axios.post(
                `${API_URL}/api/interview/question`,
                {
                    sessionId,
                    position: activeSession?.jobTitle || 'Developer',
                    level: activeSession?.jobCategory || 'Junior',
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                const q = res.data.data;
                const text = q.questionText || q.question;
                if (q._id) setCurrentQuestionId(q._id);
                setMessages((prev) => [
                    ...prev,
                    { role: 'ai', text, meta: q.questionType || 'Mixed' },
                ]);
                if (!isFirst) setQuestionIndex((i) => i + 1);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSend = async () => {
        if (!userAnswer.trim() || submitting) return;
        const answer = userAnswer.trim();
        setMessages((prev) => [...prev, { role: 'user', text: answer }]);
        setUserAnswer('');
        setSubmitting(true);

        try {
            let data = {};
            if (currentQuestionId) {
                const evalRes = await axios.post(
                    `${API_URL}/api/interview/submit-answer`,
                    { questionId: currentQuestionId, userAnswer: answer, responseTime: 60 },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                data = evalRes.data.data || evalRes.data;
            } else {
                const evalRes = await axios.post(
                    `${API_URL}/api/interview/evaluate`,
                    { question: messages.filter((m) => m.role === 'ai').slice(-1)[0]?.text || '', answer },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                data = evalRes.data.data || evalRes.data;
            }
            const score = data.aiScore ?? data.score ?? '—';
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    text: `Điểm: ${score}/100\n\n${data.aiFeedback || data.feedback || 'Cảm ơn bạn đã trả lời.'}`,
                    isFeedback: true,
                },
            ]);

            if (questionIndex >= totalQuestions - 1) {
                await axios.post(
                    `${API_URL}/api/interview/${sessionId}/complete`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTimeout(() => navigate(`/interview/${sessionId}/result`), 1500);
            } else {
                setTimeout(() => fetchQuestion(session), 1200);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <SeekerLayout title="Phòng phỏng vấn">
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-[#0A2463]" />
                </div>
            </SeekerLayout>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A2463] flex flex-col">
            <header className="flex items-center justify-between px-4 py-3 bg-[#071A4A] text-white border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="font-bold">JOB<span className="text-[#F5C518]">READY</span></span>
                    <span className="text-white/50 text-sm hidden sm:inline">| Phòng phỏng vấn AI</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-[#F5C518]">⏱ {formatTime(timeLeft)}</span>
                    <span className="text-xs text-white/60">Câu {questionIndex + 1}/{totalQuestions}</span>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row gap-0 min-h-0 overflow-hidden">
                {/* Camera Section - Fixed Height, No Scroll */}
                <div className="w-full lg:w-1/2 flex flex-col p-4 lg:max-h-screen">
                    <div className="flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A3A7C] to-[#0A2463] border border-white/10 flex items-center justify-center">
                        {cameraError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0A2463]/80 backdrop-blur z-10">
                                <div className="text-center text-white max-w-xs">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                                    <p className="text-sm">{cameraError}</p>
                                </div>
                            </div>
                        )}
                        {camOn && !cameraError ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-center">
                                <div className={`w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center ${camOn ? 'bg-[#0A2463]/80 ring-4 ring-[#F5C518]/40' : 'bg-gray-700'}`}>
                                    {camOn ? (
                                        <User className="w-16 h-16 text-white/80" />
                                    ) : (
                                        <Video className="w-12 h-12 text-white/40" />
                                    )}
                                </div>
                                <p className="text-white font-semibold">Ứng viên</p>
                                <p className="text-white/50 text-xs mt-1">Camera {camOn ? 'bật' : 'tắt'}</p>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                            <button type="button" onClick={toggleMic} className={`p-3 rounded-full transition-all ${micOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
                            <button type="button" onClick={toggleCamera} className={`p-3 rounded-full transition-all ${camOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                                <Video size={20} />
                            </button>
                            <button type="button" onClick={() => navigate('/interview-history')} className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700">
                                <PhoneOff size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat Section - Scrollable */}
                <div className="w-full lg:w-1/2 flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-[#DDE3F0] lg:max-h-screen">
                    <div className="px-4 py-3 border-b border-[#DDE3F0] flex items-center gap-2 flex-shrink-0">
                        <Bot className="text-[#0A2463]" size={20} />
                        <span className="font-semibold text-[#0A2463] text-sm">Trò chuyện phỏng vấn</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                                        m.role === 'user'
                                            ? 'bg-[#0A2463] text-white rounded-br-md'
                                            : m.isFeedback
                                            ? 'bg-[#F5C518]/15 text-[#0A2463] border border-[#F5C518]/30 rounded-bl-md'
                                            : 'bg-[#F4F6FB] text-[#0A2463] rounded-bl-md'
                                    }`}
                                >
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {submitting && (
                            <div className="flex items-center gap-2 text-[#5A6482] text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" /> AI đang chấm điểm...
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-3 border-t border-[#DDE3F0] flex gap-2 flex-shrink-0">
                        <div className="flex-1 flex gap-1">
                            <input
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                placeholder="Nhập hoặc nói câu trả lời..."
                                className="flex-1 px-3 py-2.5 rounded-xl border border-[#DDE3F0] text-sm focus:ring-2 focus:ring-[#0A2463] outline-none"
                                disabled={submitting}
                            />
                            <button
                                type="button"
                                onClick={isListening ? stopListening : startListening}
                                className={`px-3 py-2.5 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white' : 'bg-[#0A2463] text-white hover:bg-[#071A4A]'}`}
                                title={isListening ? 'Dừng lắng nghe' : 'Bắt đầu nói'}
                            >
                                <Mic2 size={18} />
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={submitting || !userAnswer.trim()}
                            className="p-2.5 bg-[#0A2463] text-white rounded-xl hover:bg-[#071A4A] disabled:opacity-40 transition-all"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
