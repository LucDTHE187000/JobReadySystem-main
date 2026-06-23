import { GoogleGenerativeAI } from '@google/generative-ai';
import InterviewService from './interview.service.js';
import SimpleInterviewService from './simpleInterview.service.js';
import n8nInterviewService from '../../services/n8nInterview.service.js';
import InterviewSession from './interview.model.js';
import InterviewQuestion from './interviewQuestion.model.js';
import { UserModel } from '../users/user.model.js';

const activeGenerations = new Set();

function isMockQuestion(questionText, isIT) {
    if (!questionText) return true;
    const lower = questionText.toLowerCase();
    
    // 1. Check for unparsed N8N template tags/variables
    if (lower.includes('$json.') || lower.includes('{{') || lower.includes('}}')) {
        return true;
    }
    
    // 2. Check for specific monolithic/microservices/architecture questions leaking into non-IT interviews
    if (!isIT && /(monolithic|microservices|rest api|graphql|database query|software architecture|system design)/i.test(lower)) {
        return true;
    }
    
    return false;
}

/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Param: [req, res]
 * Description: Controller xử lý Interview API requests
 * Endpoint: POST/GET /api/interview/...
 */

class InterviewController {
    /**
     * POST /api/interview/start
     * Tạo phiên phỏng vấn mới và sinh câu hỏi đầu tiên
     * Body: { jobTitle, jobCategory, jobDescription?, jobId?, interviewType? }
     */
    async startInterview(req, res) {
        try {
            const userId = req.user?.userId;
            const { jobTitle, jobCategory, jobDescription, jobId, interviewType, difficultyLevel } = req.body;

            if (!jobTitle || !jobCategory) {
                return res.status(400).json({ error: 'jobTitle và jobCategory là bắt buộc' });
            }

            const { deductCredits, CREDIT_COSTS } = await import('../../utils/credit.util.js');
            const { UserModel } = await import('../users/user.model.js');
            try {
                const user = await UserModel.findById(userId);
                if (!user) {
                    return res.status(404).json({ error: 'Không tìm thấy người dùng' });
                }

                if (user.freeInterviews && user.freeInterviews > 0) {
                    user.freeInterviews = user.freeInterviews - 1;
                    await user.save();
                    console.log(`[Interview Cost] User ${userId} uses 1 free combo interview. Remaining free: ${user.freeInterviews}`);
                } else {
                    await deductCredits(userId, CREDIT_COSTS.INTERVIEW_SESSION, UserModel);
                }
            } catch (creditErr) {
                return res.status(creditErr.status || 402).json({
                    error: creditErr.message || 'Không đủ credit để bắt đầu phỏng vấn',
                });
            }

            // Tạo session
            const session = await InterviewService.createInterviewSession(userId, {
                jobId,
                jobTitle,
                jobCategory,
                jobDescription,
                interviewType: interviewType || 'Mixed',
                difficultyLevel: difficultyLevel ?? 2,
            });

            // Sinh câu hỏi đầu tiên
            // const firstQuestion = await InterviewService.generateNextQuestion(session._id, req.groqClient);

            res.status(201).json({
                success: true,
                message: 'Phiên phỏng vấn đã được khởi tạo',
                data: {
                    sessionId: session._id,
                    jobTitle: session.jobTitle,
                    jobCategory: session.jobCategory,
                    totalQuestions: session.totalQuestions,
                    status: session.status,
                    // firstQuestion: firstQuestion
                },
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /api/interview/:sessionId/next-question
     * Lấy câu hỏi tiếp theo
     */
    async getNextQuestion(req, res) {
        try {
            const { sessionId } = req.params;

            const question = await InterviewService.generateNextQuestion(
                sessionId
            );

            res.status(200).json({
                success: true,
                data: question,
            });
        } catch (error) {
            console.error('Get next question error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * POST /api/interview/submit-answer
     * Ghi nhận câu trả lời, đánh giá nội bộ, KHÔNG trả về score/feedback
     * Body: { questionId, userAnswer, responseTime }
     */
    async submitAnswer(req, res) {
        try {
            const { questionId, userAnswer, responseTime } = req.body;

            if (!questionId || !userAnswer) {
                return res.status(400).json({ error: 'questionId và userAnswer là bắt buộc' });
            }

            if (!req.groqClient) {
                console.error('Groq client not available in request');
                return res.status(500).json({ error: 'AI service không khả dụng. Vui lòng kiểm tra cấu hình GROQ_API_KEY' });
            }

            // Lưu câu trả lời và đánh giá nội bộ (KHÔNG trả về feedback cho frontend)
            const evaluatedQuestion = await InterviewService.submitAnswer(
                questionId,
                userAnswer,
                responseTime || 0,
                req.groqClient
            );

            // Kiem tra xem day co phai cau cuoi khong
            const sessionForCheck = await InterviewSession.findById(evaluatedQuestion.sessionId).populate('questions');
            const totalQuestionsInSession = sessionForCheck?.totalQuestions || 10;
            const questionsArray = sessionForCheck?.questions || [];
            const answeredCount = questionsArray.filter(q => q.userAnswer && q.userAnswer.trim()).length || 0;
            
            // Stop session when user has answered the total requested number of questions
            const isLastQuestion = answeredCount >= totalQuestionsInSession;

            console.log(`[SUBMIT ANSWER] sessionId=${evaluatedQuestion.sessionId}`);
            console.log(`  Session.totalQuestions = ${totalQuestionsInSession}`);
            console.log(`  Already answered: ${answeredCount}`);
            console.log(`  isLastQuestion = ${isLastQuestion}`);

            res.status(200).json({
                success: true,
                message: 'Câu trả lời đã được ghi nhận',
                data: {
                    questionId: evaluatedQuestion._id,
                    isLastQuestion,   // Frontend dung cai nay de quyet dinh next step
                    answeredCount,
                    totalQuestions: totalQuestionsInSession,
                },
            });
        } catch (error) {
            console.error('Submit answer error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * POST /api/interview/:sessionId/complete
     * Hoàn tất phiên phỏng vấn
     */
    async completeInterview(req, res) {
        try {
            const { sessionId } = req.params;

            // Validation: Check sessionId
            if (!sessionId) {
                console.error('[COMPLETE INTERVIEW] Missing sessionId');
                return res.status(400).json({ error: 'sessionId là bắt buộc' });
            }

            // Validation: Check Groq client availability
            if (!req.groqClient) {
                console.error('[COMPLETE INTERVIEW] Groq client not available');
                return res.status(500).json({ 
                    error: 'AI service không khả dụng. Vui lòng kiểm tra cấu hình GROQ_API_KEY' 
                });
            }

            // Check if session exists and populate questions
            const session = await InterviewSession.findById(sessionId).populate('questions');
            if (!session) {
                console.error('[COMPLETE INTERVIEW] Session not found:', sessionId);
                return res.status(404).json({ error: 'Session không tìm thấy' });
            }

            console.log(`[COMPLETE INTERVIEW] Starting completion for sessionId=${sessionId}, questions=${session.questions?.length || 0}`);

            try {
                // Attempt to complete interview with full processing
                const completedSession = await InterviewService.completeInterview(
                    sessionId,
                    req.groqClient
                );

                if (!completedSession) {
                    console.error('[COMPLETE INTERVIEW] Service returned null');
                    return res.status(500).json({ error: 'Lỗi xử lý kết quả' });
                }

                console.log(`[COMPLETE INTERVIEW SUCCESS] sessionId=${sessionId}, status=${completedSession.status}`);

                res.status(200).json({
                    success: true,
                    message: 'Interview completed',
                    data: {
                        sessionId: completedSession._id,
                        status: completedSession.status,
                        averageScore: completedSession.averageScore || 0,
                        totalScore: completedSession.totalScore || 0,
                        overallFeedback: completedSession.overallFeedback || '',
                        strengths: completedSession.strengths || [],
                        improvements: completedSession.improvements || [],
                        nextSteps: completedSession.nextSteps || [],
                        duration: completedSession.duration || 0,
                    },
                });

            } catch (serviceErr) {
                // Fallback: At least mark session as completed so frontend can redirect
                console.warn(`[COMPLETE INTERVIEW FALLBACK] Service error for sessionId=${sessionId}:`, serviceErr.message);
                console.log('[COMPLETE INTERVIEW FALLBACK] Marking session as completed and returning success');
                
                await InterviewSession.findByIdAndUpdate(
                    sessionId,
                    { 
                        status: 'completed',
                        completedAt: new Date()
                    }
                );

                // Return partial success so frontend can redirect without being stuck
                res.status(200).json({
                    success: true,
                    message: 'Interview marked as completed',
                    data: {
                        sessionId: sessionId,
                        status: 'completed',
                        warning: 'Kết quả đang được xử lý, vui lòng thử lại trong giây lát',
                        averageScore: 0,
                        totalScore: 0,
                    },
                });
            }

        } catch (error) {
            console.error('[COMPLETE INTERVIEW ERROR]', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /api/interview/history
     * Lấy lịch sử phỏng vấn
     */
    async getInterviewHistory(req, res) {
        try {
            const userId = req.user?.userId;
            const { limit = 10, skip = 0 } = req.query;

            const { sessions, total } = await InterviewService.getInterviewHistory(
                userId,
                parseInt(limit),
                parseInt(skip)
            );

            res.status(200).json({
                success: true,
                data: sessions,
                pagination: { total, limit: parseInt(limit), skip: parseInt(skip) },
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /api/interview/analytics
     * Lấy thống kê hiệu suất của user
     */
    async getAnalytics(req, res) {
        try {
            const userId = req.user?.userId;

            const analytics = await InterviewService.getUserAnalytics(userId);

            res.status(200).json({
                success: true,
                data: analytics,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /api/interview/:sessionId/details
     * Lấy chi tiết phiên phỏng vấn (tất cả câu hỏi, câu trả lời, scores)
     */
    async getSessionDetails(req, res) {
        try {
            const { sessionId } = req.params;
            const data = await InterviewService.getSessionDetails(sessionId);

            if (!data) {
                return res.status(404).json({ error: 'Session not found' });
            }

            res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * POST /api/interview/question
     * Sinh 1 câu hỏi phỏng vấn dựa vào position + level
     * Body: { position, level }
     */
    async generateQuestion(req, res) {
        const { sessionId, position, level, cv, answer } = req.body;
        
        console.log(`[generateQuestion START] sessionId=${sessionId}, position=${position}, activeGenerations.size=${activeGenerations.size}`);

        if (!position || !level || !sessionId) {
            return res.status(400).json({
                error: 'sessionId, position và level là bắt buộc'
            });
        }

        // Concurrency Lock: Prevents duplicate requests from initiating parallel AI calls and creating duplicate questions
        if (activeGenerations.has(sessionId)) {
            console.log(`[CONCURRENCY LOCK] Bỏ qua cuộc gọi trùng lặp song song cho sessionId: ${sessionId}`);
            let retries = 3;
            while (activeGenerations.has(sessionId) && retries > 0) {
                await new Promise(r => setTimeout(r, 200));
                retries--;
            }
            const updatedSession = await InterviewSession.findById(sessionId).populate('questions');
            if (updatedSession && updatedSession.questions.length > 0) {
                const lastQ = updatedSession.questions[updatedSession.questions.length - 1];
                console.log(`[CONCURRENCY RETURN] Trả về câu hỏi cuối từ session, Q${lastQ.questionNumber}, answered=${!!lastQ.userAnswer}`);
                return res.status(200).json({
                    success: true,
                    data: {
                        _id: lastQ._id,
                        questionText: lastQ.questionText,
                        question: lastQ.questionText,
                        questionType: lastQ.questionType,
                        topic: lastQ.topic,
                        questionNumber: lastQ.questionNumber
                    }
                });
            }
        }
        activeGenerations.add(sessionId);
        console.log(`[generateQuestion LOCKED] activeGenerations.size=${activeGenerations.size}`);

        try {
            console.log('REQUEST BODY:', req.body);

            // Lấy dữ liệu context (Memory) từ session
            const session = await InterviewSession.findById(sessionId).populate('questions');
            if (!session) {
                return res.status(404).json({ error: 'Session không tồn tại' });
            }

            // Check based on the number of actual answered questions in the session
            const totalQLimit = session.totalQuestions || 10;
            const answeredCount = session.questions.filter(q => q.userAnswer && q.userAnswer.trim() !== '').length || 0;
            console.log(`[GEN QUESTION] sessionId=${sessionId}, answeredCount=${answeredCount}/${totalQLimit}, totalGenerated=${session.questions.length}`);
            
            if (answeredCount >= totalQLimit) {
                console.log(`[GEN QUESTION] ERROR: Session completed with ${answeredCount} answered questions`);
                return res.status(400).json({
                    error: 'Phiên phỏng vấn đã hoàn tất, không thể tạo thêm câu hỏi'
                });
            }

            // ==========================================
            // KÍCH HOẠT HỎI XOÁY ĐÁP XOAY (FOLLOW-UP)
            // Tự động kiểm tra câu hỏi trước đó có follow-up không
            // Giới hạn max 1 follow-up liên tiếp để tránh lặp vô tận
            // ==========================================
            // DISABLED: Follow-up logic causing duplicate questions and totalQuestions mismatch
            // const ENABLE_FOLLOW_UP = false;
            // if (ENABLE_FOLLOW_UP && session.questions.length > 0) {
            //     const lastQ = session.questions[session.questions.length - 1];
            //     const secondLastQ = session.questions.length > 1 ? session.questions[session.questions.length - 2] : null;
            //     const isLastQFollowUp = secondLastQ && secondLastQ.followUpAsked === true;
            //     if (lastQ.followUpQuestion && !lastQ.followUpAsked && !isLastQFollowUp) { ... }
            // }

            // ==========================================
            // CHỐNG TRÙNG LẶP CÂU HỎI KHI REFRESH (F5) HOẶC BẤM NHANH
            // Nếu câu hỏi cuối cùng trong DB chưa được trả lời, trả về luôn câu hỏi đó thay vì tạo mới
            // ==========================================
            if (session.questions.length > 0) {
                const lastQ = session.questions[session.questions.length - 1];
                const isUnanswered = !lastQ.userAnswer || lastQ.userAnswer.trim() === '';
                
                if (isUnanswered) {
                    console.log(`[REFRESH SAFE] Trả về câu hỏi cuối cùng Q${lastQ.questionNumber} chưa trả lời.`);
                    return res.status(200).json({
                        success: true,
                        data: {
                            _id: lastQ._id,
                            questionText: lastQ.questionText,
                            question: lastQ.questionText,
                            questionType: lastQ.questionType,
                            topic: lastQ.topic,
                            questionNumber: lastQ.questionNumber
                        }
                    });
                }
            }

            // ==========================================
            // CÁ NHÂN HÓA THEO CV ĐÃ PHÂN TÍCH TRÊN DB
            // ==========================================
            const userId = req.user?.userId;
            let cvSkills = [];
            let cvLevel = level;
            let cvTopics = [];
            let cvStrengths = [];
            let cvWeaknesses = [];
            let cvString = cv || "";

            if (userId) {
                const user = await UserModel.findById(userId).select('cvs').lean();
                if (user && user.cvs && user.cvs.length > 0) {
                    // Tìm CV mới nhất có dữ liệu phân tích
                    const analyzedCV = [...user.cvs].reverse().find(c => c.analysis);
                    if (analyzedCV && analyzedCV.analysis) {
                        cvSkills = analyzedCV.analysis.skills || analyzedCV.analysis.technologies || [];
                        cvLevel = analyzedCV.analysis.experienceLevel || level;
                        cvTopics = analyzedCV.analysis.recommendedInterviewTopics || [];
                        cvStrengths = analyzedCV.analysis.strengths || [];
                        cvWeaknesses = analyzedCV.analysis.weaknesses || [];
                        cvString = `Skills: ${cvSkills.join(', ')}. Level: ${cvLevel}. Recommended Topics: ${cvTopics.join(', ')}. Strengths: ${cvStrengths.join(', ')}. Weaknesses: ${cvWeaknesses.join(', ')}`;
                        console.log(`[CV Personalization] Loaded CV analysis for user ${userId}. Level: ${cvLevel}`);
                    }
                }
            }

            // Kiểm tra sự tương thích giữa CV và Vị trí phỏng vấn thực tế để tránh lệch chuyên môn
            const isIT = session.jobCategory === 'IT' || (!session.jobCategory && /(developer|software|engineer|tech|it|programmer|backend|frontend|fullstack|data|lập trình|phần mềm|hệ thống|cntt|công nghệ|web|lập trình viên)/i.test(session.jobTitle || position));
            const isSales = session.jobCategory === 'Sales' || (!session.jobCategory && /(sales|marketing|business|account|revenue|support|bán hàng|kinh doanh|tư vấn|chăm sóc|hỗ trợ|giao dịch|thị trường|telecom|telesales|nhân viên bán hàng)/i.test(session.jobTitle || position));

            const cvTextNormalized = cvString.toLowerCase();
            const cvSkillsNormalized = cvSkills.map(s => s.toLowerCase());
            const hasITContent = /(developer|software|engineer|programming|lập trình|phần mềm|cntt|system|architecture|java|python|javascript|c\+\+|html|css|react|node|database|sql|monolithic|microservices)/i.test(cvTextNormalized) || 
                                 cvSkillsNormalized.some(s => /(developer|software|engineer|programming|lập trình|phần mềm|cntt|system|architecture|java|python|javascript|c\+\+|html|css|react|node|database|sql|monolithic|microservices)/i.test(s));

            if (isSales && hasITContent) {
                console.log(`[CV MISMATCH DETECTED] Bỏ qua CV IT trong buổi phỏng vấn Sales để tránh hỏi lệch chuyên môn.`);
                cvSkills = ["Giao tiếp thuyết phục", "Chăm sóc khách hàng", "Đàm phán thương lượng", "Giải quyết khiếu nại", "Tư vấn sản phẩm"];
                cvLevel = level || "Fresher";
                cvTopics = ["Sales Process & Pipeline", "Objection Handling & Closing", "Customer Relationship Management"];
                cvStrengths = ["Kỹ năng giao tiếp xuất sắc", "Có khả năng thuyết phục và tạo dựng quan hệ khách hàng tốt"];
                cvWeaknesses = ["Chưa quen thuộc hoàn toàn với hệ thống quản lý khách hàng chuyên biệt"];
                cvString = "Ứng viên có kỹ năng giao tiếp, đàm phán và thuyết phục khách hàng tốt. Phù hợp với các vị trí kinh doanh, bán hàng, chăm sóc khách hàng.";
            } else if (isIT && !hasITContent && cvString) {
                console.log(`[CV MISMATCH DETECTED] Bỏ qua CV phi IT trong buổi phỏng vấn IT.`);
                cvSkills = ["Lập trình căn bản", "Giải quyết vấn đề", "Tư duy thuật toán", "Làm việc nhóm"];
                cvLevel = level || "Fresher";
                cvTopics = ["Core Programming Basics", "Data Structures & Algorithms", "Database & Storage"];
                cvStrengths = ["Tư duy logic tốt", "Khả năng tự học nhanh"];
                cvWeaknesses = ["Thiếu kinh nghiệm thực tế về triển khai hệ thống lớn"];
                cvString = "Ứng viên có tư duy logic và nền tảng thuật toán cơ bản, có khả năng làm việc nhóm và mong muốn phát triển trong ngành CNTT.";
            }

            const previousQuestions = session.questions.map(q => q.questionText);
            const previousAnswers = session.questions.map(q => q.userAnswer || "");
            const previousScores = session.questions.map(q => q.aiScore || 0);
            const previousTopics = session.questions.map(q => q.topic || "");

            // TÍNH TOÁN CÁC CHỈ SỐ THÔNG MINH CHO INTERVIEW ORCHESTRATION
            const interviewStage = session.questions.length + 1;
            const averageScore = previousScores.length > 0 
                ? Math.round(previousScores.reduce((a, b) => a + b, 0) / previousScores.length) 
                : 0;

            // Phân tích điểm mạnh/yếu theo từng Topic
            const topicScores = {};
            session.questions.forEach(q => {
                if (q.topic) {
                    if (!topicScores[q.topic]) topicScores[q.topic] = [];
                    topicScores[q.topic].push(q.aiScore || 0);
                }
            });

            const weakTopics = [];
            const strongTopics = [];
            for (const [t, scores] of Object.entries(topicScores)) {
                const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                if (avg < 50) weakTopics.push(t);
                else if (avg >= 80) strongTopics.push(t);
            }

            const recentScores = previousScores.slice(-3);
            const coveredDomains = [...new Set(previousTopics.filter(t => t))];

            // TÍNH TOÁN STREAK VÀ CHỐT ĐỘ KHÓ (STATE MACHINE)
            let failureStreak = 0;
            let successStreak = 0;
            for (let i = previousScores.length - 1; i >= 0; i--) {
                if (previousScores[i] < 50) {
                    failureStreak++;
                    successStreak = 0;
                } else if (previousScores[i] >= 80) {
                    successStreak++;
                    failureStreak = 0;
                } else {
                    break;
                }
            }

            let targetDifficulty = "Medium";
            if (successStreak >= 2) {
                targetDifficulty = "Hard";
            } else if (failureStreak >= 2) {
                targetDifficulty = "Easy";
            } else {
                const recentAvg = recentScores.length > 0 
                    ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length 
                    : averageScore;
                
                if (recentAvg < 50) targetDifficulty = "Easy";
                else if (recentAvg >= 75) targetDifficulty = "Hard";
                else targetDifficulty = "Medium";
            }

            // TÍNH TOÁN DOMAIN DỰA TRÊN POSITION ĐỂ PHÙ HỢP CẢ IT VÀ SALES
            let ALL_DOMAINS = [
                "Communication",
                "Problem Solving",
                "Team Collaboration",
                "Adaptability",
                "Conflict Resolution",
                "Leadership",
                "Work Ethic",
                "Self Management"
            ];

            // Chỉ ghi đè domain kỹ thuật/chuyên môn khi KHÔNG phải phỏng vấn Hành vi (Behavioral)
            if (session.interviewType !== 'Behavioral') {
                if (isIT) {
                    ALL_DOMAINS = [
                        "Core Programming Basics", 
                        "Frameworks & Tools", 
                        "Data Structures & Algorithms", 
                        "Database & Storage", 
                        "Architecture & System Design", 
                        "Security & Best Practices", 
                        "Testing & Debugging", 
                        "Performance Optimization", 
                        "DevOps & Deployment", 
                        "Soft Skills & Problem Solving"
                    ];
                } else if (isSales) {
                    ALL_DOMAINS = [
                        "Lead Generation & Prospecting",
                        "Sales Process & Pipeline",
                        "Customer Relationship Management",
                        "Objection Handling & Closing",
                        "Product & Market Knowledge",
                        "Negotiation & Pricing",
                        "Communication & Soft Skills",
                        "Time Management & Goals"
                    ];
                }
            }
            
            // Lọc ra các domain chưa được hỏi
            let availableDomains = ALL_DOMAINS.filter(d => !coveredDomains.includes(d));
            
            // Nếu đã hỏi hết các domain cơ bản, trộn lại toàn bộ
            if (availableDomains.length === 0) {
                availableDomains = ALL_DOMAINS;
            }
            
            // Random 1 domain trong số các domain chưa hỏi
            const targetDomain = availableDomains[Math.floor(Math.random() * availableDomains.length)];

            let result;
            try {
                result = await n8nInterviewService.generateQuestion({
                    sessionId,
                    position: session.jobTitle || position,
                    level: cvLevel,
                    cv: cvString,
                    skills: cvSkills,
                    experienceLevel: cvLevel,
                    recommendedTopics: cvTopics,
                    cvStrengths,
                    cvWeaknesses,
                    answer,
                    previousQuestions,
                    previousAnswers,
                    previousScores,
                    previousTopics,
                    interviewStage,
                    averageScore,
                    recentScores,
                    coveredDomains,
                    weakTopics,
                    strongTopics,
                    failureStreak,
                    successStreak,
                    targetDifficulty,
                    targetDomain,
                    interviewType: session.interviewType || 'Mixed'
                });
            } catch (n8nErr) {
                console.warn("[N8N FAIL-SAFE] Lỗi khi gọi N8N, sử dụng ngân hàng câu hỏi dự phòng cục bộ:", n8nErr.message);
            }

            // Hàm bóc tách dữ liệu đệ quy chống mọi loại wrapper của n8n
            function extractQuestionData(obj) {
                if (!obj) return {};
                if (typeof obj === 'string') {
                    try {
                        obj = JSON.parse(obj.replace(/```json/g, '').replace(/```/g, '').trim());
                    } catch(e) {
                        return {};
                    }
                }
                if (obj.questionText || obj.question) return obj;
                if (obj.json && (obj.json.questionText || obj.json.question)) return obj.json;
                
                if (Array.isArray(obj)) {
                    for (let item of obj) {
                        let res = extractQuestionData(item);
                        if (res && (res.questionText || res.question)) return res;
                    }
                } else if (typeof obj === 'object') {
                    for (let key in obj) {
                        // Nếu key là 'questions' và obj[key] là array, lấy phần tử đầu tiên
                        let extractValue = obj[key];
                        if (key === 'questions' && Array.isArray(extractValue) && extractValue.length > 0) {
                            if (extractValue.length > 1) {
                                console.warn(`[WARN] Gemini/N8N trả về 'questions' array với ${extractValue.length} items, chỉ lấy phần tử đầu tiên`);
                            }
                            extractValue = extractValue[0];
                        }
                        
                        let res = extractQuestionData(extractValue);
                        if (res && (res.questionText || res.question)) return res;
                    }
                }
                return {};
            }

            let aiResponse = extractQuestionData(result);
            console.log('[DEBUG] extractQuestionData result:', JSON.stringify(aiResponse).substring(0, 300));
            
            // Nếu aiResponse là array thay vì object, lấy phần tử đầu tiên
            if (Array.isArray(aiResponse)) {
                console.warn('[BUG DETECTED] extractQuestionData trả về array thay vì object! Lấy phần tử đầu tiên.');
                aiResponse = aiResponse[0] || {};
            }
            
            let questionText = aiResponse.questionText || aiResponse.question || "";

            // ==========================================
            // ENHANCED DUPLICATE DETECTION
            // ==========================================
            function isDuplicateQuestion(newQ, previousQuestions) {
                if (!newQ || newQ.trim().length <= 50 || previousQuestions.length === 0) return false;
                
                const normalize = (q) => {
                    return q.toLowerCase().trim()
                        .replace(/[^\w\s]/g, '') // Remove punctuation
                        .replace(/\s+/g, ' ')    // Normalize spaces
                        .trim();
                };
                
                const extractKeywords = (q) => {
                    // Extract key technical/business terms (5+ chars)
                    return q.match(/\b[a-z]{5,}/g) || [];
                };
                
                const newQNorm = normalize(newQ);
                const newQKeywords = new Set(extractKeywords(newQNorm));
                
                for (let prevQ of previousQuestions) {
                    const prevQNorm = normalize(prevQ);
                    const prevQKeywords = new Set(extractKeywords(prevQNorm));
                    
                    // 1. EXACT MATCH - normalized text is identical
                    if (prevQNorm === newQNorm) {
                        console.warn(`[DUP CHECK] Exact match detected`);
                        return true;
                    }
                    
                    // 2. PREFIX MATCH - first 100+ chars match (more generous than 80)
                    if (newQNorm.substring(0, 100) === prevQNorm.substring(0, 100)) {
                        console.warn(`[DUP CHECK] Prefix match (first 100 chars)`);
                        return true;
                    }
                    
                    // 3. KEYWORD MATCH - if 85%+ of keywords match (indicates similar topic)
                    const commonKeywords = [...newQKeywords].filter(k => prevQKeywords.has(k));
                    const matchRatio = newQKeywords.size > 0 
                        ? commonKeywords.length / newQKeywords.size 
                        : 0;
                    
                    if (matchRatio >= 0.85) {
                        console.warn(`[DUP CHECK] Keyword match: ${matchRatio.toFixed(2)} (${commonKeywords.length}/${newQKeywords.size})`);
                        return true;
                    }
                }
                return false;
            }

            // Check for duplicate - if found, force regeneration with explicit warning
            let regenerateAttempts = 0;
            while (isDuplicateQuestion(questionText, previousQuestions) && regenerateAttempts < 2) {
                regenerateAttempts++;
                console.warn(`[DUPLICATE DETECTED - REGEN ATTEMPT ${regenerateAttempts}] Forcing regeneration to get unique question`);
                try {
                    result = await n8nInterviewService.generateQuestion({
                        sessionId,
                        position: session.jobTitle || position,
                        level: cvLevel,
                        cv: cvString,
                        skills: cvSkills,
                        experienceLevel: cvLevel,
                        recommendedTopics: cvTopics,
                        cvStrengths,
                        cvWeaknesses,
                        answer,
                        previousQuestions,
                        previousAnswers,
                        previousScores,
                        previousTopics,
                        interviewStage,
                        averageScore,
                        recentScores,
                        coveredDomains,
                        weakTopics,
                        strongTopics,
                        failureStreak,
                        successStreak,
                        targetDifficulty,
                        targetDomain,
                        interviewType: session.interviewType || 'Mixed'
                    });
                    aiResponse = extractQuestionData(result);
                    if (Array.isArray(aiResponse)) {
                        aiResponse = aiResponse[0] || {};
                    }
                    questionText = aiResponse.questionText || aiResponse.question || "";
                } catch (regenErr) {
                    console.error("[REGEN ERROR] Failed to regenerate question:", regenErr.message);
                    questionText = "";
                    break;
                }
            }

            // Check if N8N returned mock/templated question or failed completely
            if (!questionText || isMockQuestion(questionText, isIT)) {
                console.log(`[FALLBACK TRIGGER] N8N empty/mock or duplicate detected. Trying Groq...`);
                try {
                    // Build danh sach cau hoi da hoi
                    const prevQList = previousQuestions.length > 0
                        ? previousQuestions.map((q, i) => `${i+1}. ${q}`).join('\n')
                        : 'Chua co cau hoi nao';
                    const levelLabels = {
                        'Intern':'0-1 nam', 'Fresher':'duoi 1 nam',
                        'Junior':'1-2 nam', 'Mid':'3-5 nam', 'mid':'3-5 nam',
                        'Senior':'5+ nam, dan dat team',
                    };
                    const levelLabel = levelLabels[cvLevel] || cvLevel || '2-3 nam';
                    const prompt = `Bạn là kỹ sư senior 10+ năm kinh nghiệm, đang phỏng vấn ứng viên vị trí ${session.jobTitle || position}.

THÔNG TIN PHỎNG VẤN:
- Vị trí: ${session.jobTitle || position}
- Level: ${cvLevel} (${levelLabel})
- Loại phỏng vấn: ${session.interviewType || 'Mixed'}
- Độ khó: ${targetDifficulty}
- Chủ đề: ${targetDomain}
- Câu số: ${interviewStage}/10 | Điểm trung bình hiện tại: ${averageScore}/100

HỒ SƠ ỨNG VIÊN:
- Kỹ năng: ${cvSkills.join(', ') || 'Chưa rõ'}
- Điểm mạnh: ${cvStrengths.join(', ') || 'Chưa rõ'}
- Điểm yếu (hãy khai thác): ${cvWeaknesses.join(', ') || 'Chưa rõ'}
- Chủ đề đề xuất: ${cvTopics.join(', ') || 'General'}

★ CÁC CÂU ĐÃ HỎI (TUYỆT ĐỐI KHÔNG LẶP LẠI - PHẢI KHÁC HOÀN TOÀN):
${prevQList}

★ YÊU CẦU CHI TIẾT:
1. Câu hỏi PHẢI KHÁC HOÀN TOÀN với tất cả câu trên (không cùng chủ đề, không giống công thức)
2. Dùng tiếng Việt tự nhiên, chuyên nghiệp, không máy móc
3. Độ khó: ${targetDifficulty}
   - Hard+Senior/Mid: hỏi system design, trade-off, kiến trúc, xử lý failure production, kinh nghiệm dẫn dắt
   - Hard+Junior: hỏi debug khó, xử lý lỗi cụ thể, tối ưu code
   - Medium: hỏi tình huống thực tế, giải quyết vấn đề
   - Easy: hỏi kiến thức nền tảng, khái niệm cơ bản
4. Ưu tiên khai thác điểm yếu: ${cvWeaknesses.join(', ')}
5. Nếu ${interviewStage >= 6 ? "đã hỏi quá nhiều câu Behavioral, ưu tiên Technical" : "số câu <= 3, có thể hỏi cả Behavioral lẫn Technical"}

★ TUYỆT ĐỐI KHÔNG:
- Hỏi những từ khóa/kỹ năng đã hỏi trong các câu trên
- Hỏi câu mở hình "hãy kể về một dự án" nếu đã hỏi như vậy rồi
- Để lại placeholder hoặc template tag ({{...}}, \$json....)
- Sinh câu hỏi quá ngắn (phải >= 20 từ) hoặc quá dài (< 200 từ)

Trả về JSON THUẦN TUY (không markdown, không text ngoài):
{"questionText": "<câu hỏi tiếng Việt 20-150 từ>", "questionType": "Technical hoặc Behavioral", "topic": "${targetDomain}"}`;

                    const groqRaw = await req.groqClient.generateWithPrompt(prompt);
                    const parsedQuestion = req.groqClient.parseJsonResponse(groqRaw) || JSON.parse(groqRaw);
                    
                    if (parsedQuestion && (parsedQuestion.questionText || parsedQuestion.question)) {
                        questionText = parsedQuestion.questionText || parsedQuestion.question;
                        
                        // Re-check for duplicates after Groq generation
                        if (isDuplicateQuestion(questionText, previousQuestions)) {
                            console.warn(`[GROQ DUPE CHECK FAILED] Groq still returned duplicate, retrying once with explicit unique requirement...`);
                            try {
                                const groqRawRetry = await req.groqClient.generateWithPrompt(prompt + "\nCHÚ Ý: Câu hỏi trước đó bị trùng lặp. Hãy tạo câu hỏi HOÀN TOÀN khác biệt về chủ đề hoặc cách hỏi.");
                                const parsedQuestionRetry = req.groqClient.parseJsonResponse(groqRawRetry) || JSON.parse(groqRawRetry);
                                if (parsedQuestionRetry && (parsedQuestionRetry.questionText || parsedQuestionRetry.question)) {
                                    questionText = parsedQuestionRetry.questionText || parsedQuestionRetry.question;
                                    aiResponse.questionText = questionText;
                                    aiResponse.question = questionText;
                                    aiResponse.questionType = parsedQuestionRetry.questionType || 'Technical';
                                    aiResponse.topic = parsedQuestionRetry.topic || targetDomain;
                                }
                            } catch (retryErr) {
                                console.error("[GROQ RETRY ERROR] Groq retry failed:", retryErr.message);
                                questionText = "";
                            }
                        } else {
                            aiResponse.questionText = questionText;
                            aiResponse.question = questionText;
                            aiResponse.questionType = parsedQuestion.questionType || 'Technical';
                            aiResponse.topic = parsedQuestion.topic || targetDomain;
                            console.log(`[GROQ FALLBACK SUCCESS] Generated unique question: "${questionText.substring(0, 80)}..."`);
                        }
                    }
                } catch (groqErr) {
                    console.error("[GROQ FALLBACK ERROR] Lỗi khi gọi Groq để sinh câu hỏi:", groqErr.message);
                    console.log("[GROQ FALLBACK] Groq thất bại, sử dụng câu hỏi dự phòng tĩnh.");
                }
            }

            // Dọn dẹp thẻ placeholder rò rỉ nếu vẫn còn
            if (questionText && (questionText.includes('$json.skills') || questionText.includes('{{'))) {
                const replacementSkill = cvSkills.length > 0 ? cvSkills[0] : "kỹ năng chuyên môn";
                questionText = questionText
                    .replace(/\{\{\s*\$json\.skills\s*\}\}/g, cvSkills.join(', ') || replacementSkill)
                    .replace(/\{\{\s*\$json\.skills\[0\]\s*\}\}/g, replacementSkill)
                    .replace(/\$json\.skills\[0\]/g, replacementSkill)
                    .replace(/\$json\.skills/g, replacementSkill)
                    .replace(/\{\{/g, '')
                    .replace(/\}\}/g, '');
                aiResponse.questionText = questionText;
                aiResponse.question = questionText;
            }

            // Nếu sau mọi cố gắng vẫn không có câu hỏi, dùng static fallback
            if (!questionText) {
                console.warn("[STATIC FALLBACK] Cả N8N và Groq đều không khả dụng. Sử dụng câu hỏi dự phòng tĩnh.");
                const fallbackQ = InterviewService.getFallbackQuestion(
                    isSales ? 'Sales' : (isIT ? 'IT' : 'General'),
                    session.interviewType || 'Mixed',
                    session.questions.length
                );
                questionText = fallbackQ.question;
                aiResponse = {
                    questionText: questionText,
                    question: questionText,
                    questionType: fallbackQ.type,
                    topic: fallbackQ.topic
                };
            }

            let rawType = aiResponse.questionType || aiResponse.evaluation_focus || aiResponse.type || 'Technical';
            let questionType = 'Technical';
            if (rawType) {
                const normalized = rawType.toLowerCase();
                if (normalized.includes('system design')) questionType = 'System Design';
                else if (normalized.includes('behavioral')) questionType = 'Behavioral';
                else if (normalized.includes('technical')) questionType = 'Technical';
            }

            // KIỂM TRA LẦN CUỐI SỰ RÒ RỈ TỪ KHÓA IT
            const questionLower = questionText.toLowerCase();
            const containsITKeywords = /(monolithic|microservices|rest api|graphql|sql|left join|inner join|database query|dependency injection|code review|software development|system design)/i.test(questionLower);
            
            if (isSales && containsITKeywords) {
                console.log(`[SAFE FALLBACK] Phát hiện câu hỏi IT rò rỉ sang Sales. Sử dụng câu hỏi từ Ngân hàng câu hỏi Sales.`);
                const fallbackQ = InterviewService.getFallbackQuestion("Sales", session.interviewType || 'Behavioral', session.questions.length);
                questionText = fallbackQ.question;
                questionType = fallbackQ.type;
                aiResponse.questionText = questionText;
                aiResponse.question = questionText;
                aiResponse.questionType = questionType;
            } else if (isIT && !containsITKeywords && !hasITContent) {
                console.log(`[SAFE FALLBACK] Phát hiện câu hỏi không chuyên môn IT. Sử dụng câu hỏi từ Ngân hàng câu hỏi IT.`);
                const fallbackQ = InterviewService.getFallbackQuestion("IT", session.interviewType || 'Behavioral', session.questions.length);
                questionText = fallbackQ.question;
                questionType = fallbackQ.type;
                aiResponse.questionText = questionText;
                aiResponse.question = questionText;
                aiResponse.questionType = questionType;
            }

            if (session) {
                const topic = targetDomain;
                const aiFeedback = aiResponse.aiFeedback || '';
                const nextQuestionNumber = session.questions.length + 1;
                
                console.log(`[SAVE QUESTION] sessionId=${sessionId}, sessionQuestionCount=${session.questions.length}, calculatedQuestionNumber=${nextQuestionNumber}, questionText="${questionText.substring(0, 80)}..."`);
                
                // Check xem questionText có chứa 2 câu hỏi không (nếu có "\n1." hoặc "1."  hoặc "2." ở đầu dòng)
                const questionLines = questionText.split('\n').filter(l => l.trim());
                if (questionLines.length > 2 && /^\d+\.|Câu \d+:|Question \d+:/.test(questionText)) {
                    console.warn('[WARNING] questionText có vẻ chứa nhiều câu hỏi được numbered! Log toàn bộ:', questionText);
                }

                const newQuestion = new InterviewQuestion({
                    sessionId,
                    questionNumber: nextQuestionNumber,
                    questionText: questionText,
                    questionType: questionType,
                    topic: topic,
                    aiFeedback: aiFeedback,
                    followUpQuestion: aiResponse?.followUpQuestion || ''
                });

                await newQuestion.save();
                console.log(`[SAVED QUESTION] _id=${newQuestion._id}, questionNumber=${newQuestion.questionNumber}, sessionId=${sessionId}`);
                
                session.questions.push(newQuestion._id);
                await session.save();
                console.log(`[SESSION UPDATED] sessionId=${sessionId}, totalQuestions=${session.questions.length}`);

                aiResponse._id = newQuestion._id;
                aiResponse.questionText = questionText;
                aiResponse.question = questionText;
                aiResponse.questionType = questionType;
                aiResponse.topic = topic;
                if (aiFeedback) aiResponse.aiFeedback = aiFeedback;
            }

            res.status(200).json({
                success: true,
                data: aiResponse
            });
            
            console.log(`[generateQuestion DONE] sessionId=${sessionId}, questionNumber=${aiResponse.questionNumber || 'N/A'}`);

        } catch (error) {
            console.error('Generate question error:', error);
            res.status(500).json({
                error: error.message
            });
        } finally {
            activeGenerations.delete(sessionId);
            console.log(`[generateQuestion FINALLY] activeGenerations.size=${activeGenerations.size}`);
        }
    }

    /**
     * POST /api/interview/evaluate
     * Chấm điểm câu trả lời (1-10)
     * Body: { question, answer }
     */
    async evaluateAnswer(req, res) {
        try {
            const { question, answer } = req.body;

            if (!question || !answer) {
                return res.status(400).json({
                    error: 'question và answer là bắt buộc'
                });
            }

            let evaluation = null;
            let rawResponse = null;

            // Try N8N service first
            try {
                rawResponse = await n8nInterviewService.evaluateAnswer({
                    question,
                    answer
                });
                console.log('[N8N Response]', JSON.stringify(rawResponse, null, 2));
                
                // Extract score from N8N response - handle nested structures
                if (typeof rawResponse === 'string') {
                    try {
                        rawResponse = JSON.parse(rawResponse);
                    } catch (e) {
                        // If JSON parse fails, try to extract JSON from string
                        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            rawResponse = JSON.parse(jsonMatch[0]);
                        }
                    }
                }

                // Extract evaluation data from various possible response structures
                evaluation = {
                    aiScore: rawResponse?.aiScore ?? rawResponse?.score ?? rawResponse?.data?.score ?? rawResponse?.data?.aiScore ?? 0,
                    aiFeedback: rawResponse?.aiFeedback ?? rawResponse?.feedback ?? rawResponse?.data?.feedback ?? rawResponse?.data?.aiFeedback ?? '',
                    keyPoints: rawResponse?.keyPoints ?? rawResponse?.strengths ?? rawResponse?.data?.keyPoints ?? rawResponse?.data?.strengths ?? [],
                    missedPoints: rawResponse?.missedPoints ?? rawResponse?.improvements ?? rawResponse?.weaknesses ?? rawResponse?.data?.missedPoints ?? rawResponse?.data?.improvements ?? [],
                    suggestions: rawResponse?.suggestions ?? rawResponse?.recommendations ?? rawResponse?.data?.suggestions ?? rawResponse?.data?.recommendations ?? [],
                    followUpQuestion: rawResponse?.followUpQuestion ?? rawResponse?.data?.followUpQuestion ?? ''
                };
            } catch (n8nError) {
                console.warn('N8N evaluation failed, trying SimpleInterview service:', n8nError.message);
                
                // Fallback to SimpleInterview
                try {
                    evaluation = await SimpleInterviewService.evaluateAnswer(question, answer);
                } catch (simpleErr) {
                    console.warn('SimpleInterview also failed:', simpleErr.message);
                    evaluation = null;
                }
            }

            // Ensure we have a valid score
            let score = evaluation?.aiScore ?? 0;
            
            // If score is 0 and we had a response, something went wrong - use fallback
            if (score === 0 && evaluation?.aiFeedback) {
                // Feedback exists but score is 0, this might be valid
                score = 70; // Use neutral score
            } else if (score === 0 && !evaluation?.aiFeedback) {
                // No score and no feedback - use complete fallback
                score = 50;
            }

            // Normalize score to 0-100
            const finalScore = score <= 10 ? Math.round(score * 10) : Math.min(100, Math.max(0, Math.round(score)));

            const response = {
                success: true,
                data: {
                    aiScore: finalScore,
                    aiFeedback: evaluation?.aiFeedback ?? 'Cảm ơn bạn đã trả lời câu hỏi này.',
                    keyPoints: Array.isArray(evaluation?.keyPoints) ? evaluation.keyPoints : [],
                    missedPoints: Array.isArray(evaluation?.missedPoints) ? evaluation.missedPoints : [],
                    suggestions: Array.isArray(evaluation?.suggestions) ? evaluation.suggestions : [],
                    followUpQuestion: evaluation?.followUpQuestion ?? ''
                }
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Evaluate answer error:', error);
            
            // Return fallback response to prevent interview interruption
            res.status(200).json({
                success: true,
                data: {
                    aiScore: 70,
                    aiFeedback: 'Hệ thống AI đang được cải thiện. Câu trả lời của bạn đã được ghi nhận.',
                    keyPoints: ['Đã cố gắng trả lời đầy đủ'],
                    missedPoints: [],
                    suggestions: ['Hãy cung cấp thêm chi tiết cụ thể và ví dụ minh họa'],
                    followUpQuestion: ''
                }
            });
        }
    }
}
export default new InterviewController();