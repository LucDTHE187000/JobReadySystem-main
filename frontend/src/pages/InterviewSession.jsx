
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, Loader2, Mic, MicOff, Video, PhoneOff, Bot, User, AlertCircle, Mic2} from 'lucide-react';
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
    const questionFetchedRef = useRef(false); // Use ref to prevent double fetches
    const previousSessionIdRef = useRef(null); // Track session changes

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
        // Only reset questionFetched ref when sessionId actually changes
        if (previousSessionIdRef.current !== sessionId) {
            console.log(`[SETUP EFFECT] SessionId changed from ${previousSessionIdRef.current} to ${sessionId}, resetting fetch flag`);
            questionFetchedRef.current = false;
            previousSessionIdRef.current = sessionId;
        }
        
        console.log('[SETUP EFFECT] Running for sessionId:', sessionId, 'questionFetched:', questionFetchedRef.current);
        
        initSession();
        setupCamera();
        setupSpeechRecognition();
        
        return () => {
            console.log('[SETUP EFFECT CLEANUP] Cleaning up streams for sessionId:', sessionId);
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
        console.log('[INIT SESSION] Called, ref.current =', questionFetchedRef.current);
        if (!sessionId) { setLoading(false); return; }
        
        // Use ref to prevent double fetch - persists across re-renders
        if (questionFetchedRef.current) {
            console.log('[INIT SESSION] Already initialized, skipping...');
            return;
        }
        console.log('[INIT SESSION] First time, setting ref to true');
        questionFetchedRef.current = true;
        
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/interview/${sessionId}/details`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const s = res.data.data?.session || res.data.data;
            if (!s) throw new Error('Session data empty');
            setSession(s);
            setTotalQuestions(s?.totalQuestions || 5);
            setMessages([{ role: 'ai', text: `Xin chào! Tôi là AI phỏng vấn JobReady. Hôm nay chúng ta sẽ luyện tập vị trí **${s?.jobTitle || ''}**. Hãy trả lời tự tin và rõ ràng nhé!` }]);
            setLoading(false);
            
            // Schedule first question fetch with delay
            console.log('[INIT SESSION] Session loaded, scheduling first question fetch in 500ms...');
            setTimeout(() => {
                console.log('[FETCH QUESTION] Starting first question fetch (from init)...');
                fetchQuestion(s, true).catch(err => console.error('[FETCH QUESTION ERROR]', err));
            }, 500); // 500ms delay to prevent race conditions
            
            return;
        } catch (e) {
            console.error('[INIT SESSION ERROR]', e?.response?.data || e.message);
            questionFetchedRef.current = false; // Reset on error so we can retry
        }
        setLoading(false);
    };

    const fetchQuestion = async (activeSession = session, isFirst = false) => {
        try {
            console.log('[FETCH QUESTION] Requesting question for session:', sessionId);
            const res = await axios.post(
                `${API_URL}/api/interview/question`,
                {
                    sessionId,
                    position: activeSession?.jobTitle || 'Developer',
                    level: activeSession?.jobCategory || 'Junior',
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (!res.data.success) {
                console.warn('[FETCH QUESTION] API returned success=false');
                return;
            }

            const q = res.data.data;
            let text = q.questionText || q.question || '';
            const qId = q._id?.toString();

            console.log('[FETCH QUESTION] Received question:', qId, text.substring(0, 80));

            // Remove duplicate questions if AI accidentally sends 2 questions in one response
            const multiQuestionMatch = text.match(
                /^(1\.|Câu 1:|Question 1:|\d+\.)\s*[\s\S]*?(2\.|Câu 2:|Question 2:|\d+\.)/
            );
            if (multiQuestionMatch) {
                console.warn('[FETCH QUESTION] Detected multiple questions in single response. Extracting first question only.');
                const secondQStart = text.indexOf(multiQuestionMatch[2]);
                text = text.substring(0, secondQStart).trim();
                text = text.replace(/\d+\.\s*$/, '').trim();
            }

            // Check if this question is already displayed (by comparing with last AI message)
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
            if (lastMessage?.role === 'ai' && lastMessage?.text?.includes(text.substring(0, 50))) {
                console.log('[FETCH QUESTION] Question already displayed, skipping duplicate');
                return;
            }

            // Only update state once - BOTH states together, not in a callback
            console.log('[FETCH QUESTION] New question - adding to chat');
            setCurrentQuestionId(qId);
            setMessages((m) => [
                ...m,
                { role: 'ai', text, meta: q.questionType || 'Mixed' },
            ]);

        } catch (e) {
            console.error('[FETCH QUESTION ERROR]', e?.response?.data || e.message);
        }
    };

    const handleSend = async () => {
        if (!userAnswer.trim() || submitting) return;
        const answer = userAnswer.trim();
        setMessages((prev) => [...prev, { role: 'user', text: answer }]);
        setUserAnswer('');
        setSubmitting(true);

        try {
            if (!currentQuestionId) return;

            console.log('[SUBMIT ANSWER] Submitting answer for question:', currentQuestionId);
            const submitRes = await axios.post(
                `${API_URL}/api/interview/submit-answer`,
                { questionId: currentQuestionId, userAnswer: answer, responseTime: 60 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { isLastQuestion } = submitRes.data?.data || {};

            if (isLastQuestion) {
                // Last question - complete interview and redirect to result
                console.log('[LAST QUESTION] Completing interview session...');
                setMessages(prev => [...prev, { role: 'ai', text: '🎉 Bạn đã hoàn thành buổi phỏng vấn! Đang tạo báo cáo...' }]);
                
                try {
                    console.log('[COMPLETE INTERVIEW] Sending complete request for sessionId:', sessionId);
                    const completeRes = await axios.post(
                        `${API_URL}/api/interview/${sessionId}/complete`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    console.log('[COMPLETE INTERVIEW SUCCESS]', completeRes.data);
                    setTimeout(() => {
                        console.log('[REDIRECT] Navigating to result page');
                        navigate(`/interview/${sessionId}/result`);
                    }, 1500);
                } catch (completeErr) {
                    console.error('[COMPLETE INTERVIEW ERROR]', completeErr?.response?.data || completeErr.message);
                    setMessages(prev => [...prev, { 
                        role: 'ai', 
                        text: '⚠️ Lỗi khi tổng hợp kết quả. Vui lòng liên hệ hỗ trợ hoặc thử lại.' 
                    }]);
                    // Still redirect so user doesn't get stuck
                    setTimeout(() => {
                        console.log('[FALLBACK REDIRECT] Redirecting to result page despite error');
                        navigate(`/interview/${sessionId}/result`);
                    }, 2500);
                }
            } else {
                // Next question
                console.log('[NEXT QUESTION] Moving to next question');
                setQuestionIndex(i => i + 1);
                setTimeout(() => fetchQuestion(session), 1000);
            }
        } catch (e) {
            console.error('[HANDLE SEND ERROR]', e?.response?.data || e.message);
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
        <div style={{ height: '100vh', overflow: 'hidden' }} className="bg-[#0A2463] flex flex-col">
            <header className="flex items-center justify-between px-4 py-3 bg-[#071A4A] text-white border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <span className="font-bold">JOB<span className="text-[#F5C518]">READY</span></span>
                    <span className="text-white/50 text-sm hidden sm:inline">| Phòng phỏng vấn AI</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-[#F5C518]">⏱ {formatTime(timeLeft)}</span>
                    <span className="text-xs text-white/60">Câu {questionIndex + 1}/{totalQuestions}</span>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
                {/* Camera Section - Fixed Height, No Scroll */}
                <div className="w-full lg:w-1/2 h-full lg:h-screen sticky top-0 flex flex-col p-4 overflow-hidden">
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
                <div className="w-full lg:w-1/2 h-full lg:h-screen flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-[#DDE3F0] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#DDE3F0] flex items-center gap-2 flex-shrink-0">
                        <Bot className="text-[#0A2463]" size={20} />
                        <span className="font-semibold text-[#0A2463] text-sm">Trò chuyện phỏng vấn</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
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