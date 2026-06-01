import InterviewSession from './interview.model.js';
import InterviewQuestion from './interviewQuestion.model.js';
import InterviewAnalytics from './interviewAnalytics.model.js';
import n8nInterviewService from '../../services/n8nInterview.service.js';
/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Param: [user, jobData, groqService, etc]
 * Description: Service xử lý logic Interview Practice
 * Tạo phiên phỏng vấn, sinh câu hỏi AI, ghi nhận câu trả lời, tính điểm, phân tích
 */

class InterviewService {
    /**
     * Tạo phiên phỏng vấn mới
     * @param {ObjectId} userId
     * @param {Object} jobData - { jobId, jobTitle, jobCategory, jobDescription, interviewType }
     * @returns {Promise<Object>} - Session details with first question
     */
    async createInterviewSession(userId, jobData) {
        try {
            const session = new InterviewSession({
                userId,
                jobId: jobData.jobId || null,
                jobTitle: jobData.jobTitle,
                jobCategory: jobData.jobCategory,
                jobDescription: jobData.jobDescription || '',
                interviewType: jobData.interviewType || 'Mixed',
                difficultyLevel: jobData.difficultyLevel ?? 2,
                totalQuestions: 10, // Mặc định 10 câu hỏi
            });

            await session.save();
            return session;
        } catch (error) {
            throw new Error(`Không thể tạo phiên phỏng vấn: ${error.message}`);
        }
    }

    /**
     * Tạo câu hỏi tiếp theo (gọi AI qua n8n webhook)
     * @param {ObjectId} sessionId
     * @returns {Promise<Object>} - Question details
     */
    async generateNextQuestion(sessionId) {
        try {
            const session = await InterviewSession.findById(sessionId);
            if (!session) throw new Error('Phiên phỏng vấn không tìm thấy');

            if (session.answeredQuestions >= session.totalQuestions) {
                throw new Error('Tất cả câu hỏi trong phiên phỏng vấn này đã được trả lời');
            }

            let aiResponse;
            try {
                // Fetch previous questions and answers to send as context if needed
                const previousQs = await InterviewQuestion.find({ sessionId }).sort({ questionNumber: 1 });
                const previousQuestions = previousQs.map(q => q.questionText);
                const previousAnswers = previousQs.map(q => q.userAnswer || "");

                const payload = {
                    sessionId: session._id.toString(),
                    position: session.jobTitle,
                    level: session.jobCategory, // or interviewType
                    previousQuestions,
                    previousAnswers
                };

                aiResponse = await n8nInterviewService.generateQuestion(payload);
            } catch (_n8nErr) {
                // Fallback: dùng câu hỏi từ ngân hàng câu hỏi tĩnh khi AI không khả dụng
                aiResponse = this.getFallbackQuestion(
                    session.jobCategory,
                    session.interviewType,
                    session.answeredQuestions
                );
            }

            // Validate questionType - phải là 'Technical' hoặc 'Behavioral'
            let validType = aiResponse.type || aiResponse.questionType;
            if (!['Technical', 'Behavioral'].includes(validType)) {
                // Nếu không valid, chọn ngẫu nhiên hoặc dựa trên câu hỏi số
                validType = session.answeredQuestions % 2 === 0 ? 'Technical' : 'Behavioral';
            }

            const questionText = aiResponse.question || aiResponse.questionText || (typeof aiResponse === 'string' ? aiResponse : "Câu hỏi lỗi định dạng");

            const question = new InterviewQuestion({
                sessionId,
                questionNumber: session.answeredQuestions + 1,
                questionText: questionText,
                questionType: validType,
                topic: aiResponse.topic || 'General',
            });

            await question.save();
            session.questions.push(question._id);
            await session.save();

            return question;
        } catch (error) {
            throw new Error(`Không thể sinh câu hỏi: ${error.message}`);
        }
    }

    /**
     * Ngân hàng câu hỏi tĩnh dùng khi Groq không khả dụng
     */
    getFallbackQuestion(category, interviewType, index) {
        const banks = {
            IT: [
                { question: 'Hãy mô tả một dự án kỹ thuật khó nhất bạn từng tham gia. Bạn đã giải quyết các thách thức như thế nào?', type: 'Technical', topic: 'Project Experience' },
                { question: 'Bạn hiểu RESTful API là gì? Hãy giải thích sự khác biệt giữa GET, POST, PUT và DELETE.', type: 'Technical', topic: 'API Design' },
                { question: 'Hãy trình bày về cấu trúc dữ liệu mà bạn thường sử dụng và lý do vì sao chọn chúng.', type: 'Technical', topic: 'Data Structures' },
                { question: 'Bạn đã từng làm việc trong môi trường Agile/Scrum chưa? Trải nghiệm của bạn như thế nào?', type: 'Behavioral', topic: 'Teamwork' },
                { question: 'Kể về một lần bạn phải debug một lỗi phức tạp. Quy trình và kết quả như thế nào?', type: 'Technical', topic: 'Problem Solving' },
            ],
            Marketing: [
                { question: 'Hãy mô tả một chiến dịch marketing thành công bạn từng thiết kế hoặc tham gia.', type: 'Behavioral', topic: 'Campaign Management' },
                { question: 'Bạn sử dụng các chỉ số KPI nào để đo lường hiệu quả của một chiến dịch digital marketing?', type: 'Technical', topic: 'Analytics' },
                { question: 'Làm thế nào bạn xác định và phân tích target audience cho một sản phẩm mới?', type: 'Technical', topic: 'Market Research' },
                { question: 'Bạn đã từng xử lý phản hồi tiêu cực từ khách hàng trên mạng xã hội chưa? Kể lại.', type: 'Behavioral', topic: 'Crisis Management' },
                { question: 'Hãy giải thích sự khác biệt giữa SEO và SEM, và khi nào nên dùng cái nào.', type: 'Technical', topic: 'SEO/SEM' },
            ],
            Sales: [
                { question: 'Kể về lần bạn vượt chỉ tiêu doanh số. Bạn đã làm gì khác biệt?', type: 'Behavioral', topic: 'Sales Achievement' },
                { question: 'Bạn xử lý thế nào khi khách hàng từ chối mua hàng? Quy trình follow-up của bạn?', type: 'Behavioral', topic: 'Objection Handling' },
                { question: 'Hãy mô tả quy trình bán hàng B2B mà bạn thấy hiệu quả nhất.', type: 'Technical', topic: 'Sales Process' },
                { question: 'Bạn sử dụng CRM như thế nào để quản lý pipeline và dự báo doanh thu?', type: 'Technical', topic: 'CRM' },
                { question: 'Kể về một khách hàng khó tính nhất và cách bạn xây dựng mối quan hệ với họ.', type: 'Behavioral', topic: 'Relationship Building' },
            ],
            HR: [
                { question: 'Bạn tiếp cận thế nào khi cần tuyển dụng cho một vị trí khó tìm ứng viên phù hợp?', type: 'Technical', topic: 'Recruitment' },
                { question: 'Hãy mô tả cách bạn xử lý xung đột giữa các nhân viên trong tổ chức.', type: 'Behavioral', topic: 'Conflict Resolution' },
                { question: 'Bạn thiết kế chương trình onboarding cho nhân viên mới như thế nào?', type: 'Technical', topic: 'Onboarding' },
                { question: 'Làm thế nào để đo lường mức độ gắn kết (engagement) của nhân viên?', type: 'Technical', topic: 'Employee Engagement' },
                { question: 'Kể về một quyết định khó khăn trong quản lý nhân sự bạn đã phải đưa ra.', type: 'Behavioral', topic: 'Decision Making' },
            ],
            Finance: [
                { question: 'Hãy giải thích sự khác biệt giữa P&L Statement và Balance Sheet.', type: 'Technical', topic: 'Financial Statements' },
                { question: 'Bạn đã từng thực hiện financial modeling chưa? Describe your approach.', type: 'Technical', topic: 'Financial Modeling' },
                { question: 'Kể về một lần bạn phát hiện ra sai sót trong báo cáo tài chính. Bạn xử lý thế nào?', type: 'Behavioral', topic: 'Accuracy' },
                { question: 'Bạn sử dụng công cụ nào để phân tích rủi ro tài chính?', type: 'Technical', topic: 'Risk Analysis' },
                { question: 'Hãy mô tả quy trình lập ngân sách hàng năm bạn đã tham gia.', type: 'Technical', topic: 'Budgeting' },
            ],
            General: [
                { question: 'Hãy giới thiệu về bản thân và lý do bạn ứng tuyển vào vị trí này.', type: 'Behavioral', topic: 'Self Introduction' },
                { question: 'Điểm mạnh lớn nhất của bạn là gì, và bạn đã áp dụng nó như thế nào trong công việc?', type: 'Behavioral', topic: 'Strengths' },
                { question: 'Mô tả một tình huống bạn phải làm việc dưới áp lực cao. Kết quả ra sao?', type: 'Behavioral', topic: 'Pressure Management' },
                { question: 'Bạn có kế hoạch phát triển nghề nghiệp trong 3-5 năm tới như thế nào?', type: 'Behavioral', topic: 'Career Goals' },
                { question: 'Kể về một lần bạn thất bại và bài học bạn rút ra được từ trải nghiệm đó.', type: 'Behavioral', topic: 'Learning from Failure' },
            ],
        };

        const pool = banks[category] || banks['General'];
        const question = pool[index % pool.length];

        if (interviewType === 'Technical') {
            const technical = pool.filter(q => q.type === 'Technical');
            return technical[index % Math.max(technical.length, 1)] || question;
        }
        if (interviewType === 'Behavioral') {
            const behavioral = pool.filter(q => q.type === 'Behavioral');
            return behavioral[index % Math.max(behavioral.length, 1)] || question;
        }
        return question;
    }

    /**
     * Ghi nhận câu trả lời của user, gọi AI để feedback & scoring
     * @param {ObjectId} questionId
     * @param {String} userAnswer
     * @param {Number} responseTime
     * @param {Object} groqClient
     * @returns {Promise<Object>} - Question with feedback
     */
    async submitAnswer(questionId, userAnswer, responseTime, groqClient) {
        try {
            const question = await InterviewQuestion.findById(questionId);
            if (!question) throw new Error('Không tìm thấy câu hỏi');

            question.userAnswer = userAnswer;
            question.responseTime = responseTime;
            question.answeredAt = new Date();

            // Gọi AI để đánh giá và feedback
            let aiEvaluation;
            try {
                const session = await InterviewSession.findById(question.sessionId);
                
                aiEvaluation = await n8nInterviewService.evaluateAnswer({
                    question: question.questionText,
                    answer: userAnswer,
                    position: session?.jobTitle || 'Unknown Position',
                    level: session?.jobCategory || 'Unknown Level'
                });

                question.followUpQuestion = aiEvaluation.followUpQuestion || null;
            } catch (_n8nErr) {
                console.error("N8N Evaluate Answer fallback error, falling back to local Groq if available:", _n8nErr.message);
                if (groqClient) {
                    try {
                        const session = await InterviewSession.findById(question.sessionId);
                        const evalPrompt = `Bạn là một nhà tuyển dụng chuyên nghiệp phỏng vấn vị trí ${session?.jobTitle || 'ứng viên'}.

QUY TẮC QUAN TRỌNG:
- KHÔNG BAO GIỜ tiết lộ điểm số, đánh giá, feedback, điểm mạnh, điểm yếu trong quá trình phỏng vấn
- Chỉ đánh giá nội bộ và lưu kết quả
- Chỉ tạo câu hỏi tiếp theo hoặc câu hỏi follow-up

Hãy đánh giá câu trả lời của ứng viên cho câu hỏi sau:
Câu hỏi: "${question.questionText}"
Câu trả lời của ứng viên: "${userAnswer}"

Hãy phân tích và trả về kết quả dưới dạng JSON thuần túy (không markdown, không text ngoài) có định dạng chính xác sau:
{
  "score": <số điểm từ 0-100 dựa trên chất lượng câu trả lời - CHỈ DÙNG NỘI BỘ>,
  "feedback": "<phản hồi nhận xét chi tiết bằng tiếng Việt - CHỈ DÙNG NỘI BỘ, KHÔNG HIỂN THỊ TRONG INTERVIEW>",
  "keyPoints": [<các ý chính ứng viên đã nêu được, tối đa 3 ý>],
  "missedPoints": [<các ý quan trọng ứng viên bỏ sót hoặc có thể cải thiện, tối đa 3 ý>],
  "suggestions": [<gợi ý cụ thể giúp ứng viên trả lời tốt hơn lần sau, tối đa 3 ý>],
  "sentiment": "positive" hoặc "neutral" hoặc "negative",
  "followUpQuestion": "<câu hỏi đào sâu/xoáy thêm liên quan trực tiếp đến câu trả lời của ứng viên để kiểm tra tính trung thực hoặc chuyên sâu, giới hạn 1 câu. Nếu không cần thiết hoặc ứng viên trả lời quá kém/lạc đề thì để rỗng>"
}

LƯU Ý: Tất cả các trường score, feedback, keyPoints, missedPoints, suggestions CHỈ DÙNG ĐỂ LƯU TRỮ NỘI BỘ VÀ HIỂN THỊ TRÊN TRANG KẾT QUẢ SAU KHI PHỎNG VẤN HOÀN TẤT. KHÔNG HIỂN THỊ TRONG QUÁ TRÌNH PHỎNG VẤN.`;
                        const rawEval = await groqClient.evaluateAnswer(evalPrompt);
                        let parsedEval;
                        if (typeof rawEval === 'string') {
                            parsedEval = groqClient.parseJsonResponse(rawEval) || JSON.parse(rawEval);
                        } else {
                            parsedEval = rawEval;
                        }
                        
                        aiEvaluation = {
                            aiScore: parsedEval.score || parsedEval.aiScore || 70,
                            aiFeedback: parsedEval.feedback || parsedEval.aiFeedback || 'Đánh giá hoàn tất.',
                            keyPoints: parsedEval.keyPoints || [],
                            missedPoints: parsedEval.missedPoints || [],
                            suggestions: parsedEval.suggestions || [],
                            sentiment: parsedEval.sentiment || 'neutral',
                        };
                        question.followUpQuestion = parsedEval.followUpQuestion || null;
                    } catch (groqErr) {
                        console.error("[GROQ EVALUATION ERROR] Lỗi khi gọi Groq để đánh giá, dùng static fallback:", groqErr.message);
                        const wordCount = userAnswer.trim().split(/\s+/).length;
                        const baseScore = Math.min(70, 40 + Math.floor(wordCount / 5));
                        aiEvaluation = {
                            aiScore: baseScore,
                            aiFeedback: 'Câu trả lời đã được ghi nhận. (Đánh giá AI gặp lỗi - fallback sang đếm chữ)',
                            keyPoints: ['Đã ghi nhận nội dung trả lời'],
                            missedPoints: [],
                            suggestions: ['Hãy trình bày chi tiết và có ví dụ minh họa'],
                            sentiment: 'neutral',
                        };
                    }
                } else {
                    const wordCount = userAnswer.trim().split(/\s+/).length;
                    const baseScore = Math.min(70, 40 + Math.floor(wordCount / 5));
                    aiEvaluation = {
                        aiScore: baseScore,
                        aiFeedback: 'Câu trả lời đã được ghi nhận. (Đánh giá AI không khả dụng - fallback sang đếm chữ)',
                        keyPoints: ['Đã ghi nhận nội dung trả lời'],
                        missedPoints: [],
                        suggestions: ['Hãy trình bày chi tiết và có ví dụ minh họa'],
                        sentiment: 'neutral',
                    };
                }
            }

            question.aiScore = aiEvaluation.aiScore || aiEvaluation.score || 0;
            question.aiFeedback = aiEvaluation.aiFeedback || aiEvaluation.feedback || '';
            question.keyPoints = aiEvaluation.keyPoints || [];
            question.missedPoints = aiEvaluation.missedPoints || [];
            question.suggestions = aiEvaluation.suggestions || [];
            // Normalize sentiment — AI có thể trả về nhiều format khác nhau
            const rawSentiment = (aiEvaluation.sentiment || '').toLowerCase();
            const sentimentMap = {
                'excellent': 'excellent', 'xuất sắc': 'excellent',
                'good': 'good', 'positive': 'good', 'tốt': 'good',
                'average': 'average', 'neutral': 'average', 'trung bình': 'average',
                'poor': 'poor', 'negative': 'poor', 'k�m': 'poor', 'bad': 'poor',
            };
            question.answerSentimentAnalysis = sentimentMap[rawSentiment] || null;

            await question.save();

            // Update session scores
            await this.updateSessionScore(question.sessionId);

            return question;
        } catch (error) {
            throw new Error(`Không thể gửi câu trả lời: ${error.message}`);
        }
    }

    /**
     * Hoàn tất phiên phỏng vấn, tạo overall feedback
     * @param {ObjectId} sessionId
     * @param {Object} groqClient
     * @returns {Promise<Object>} - Completed session with analytics
     */
    async completeInterview(sessionId, groqClient) {
        try {
            const session = await InterviewSession.findById(sessionId).populate('questions');
            if (!session) throw new Error('Phiên phỏng vấn không tìm thấy');

            session.status = 'completed';
            session.completedAt = new Date();
            session.duration = Math.floor(
                (session.completedAt - session.startedAt) / 1000 // Seconds
            );

            // Tính toán điểm số tổng
            const scores = session.questions.map((q) => q.aiScore).filter((s) => s !== null);
            if (scores.length > 0) {
                session.totalScore = Math.max(...scores);
                session.averageScore = Math.round(
                    scores.reduce((a, b) => a + b, 0) / scores.length
                );
            }
            session.answeredQuestions = session.questions.length;

            // Gửi toàn bộ lịch sử sang N8N để AI tổng hợp Overall Feedback
            try {
                const previousQs = session.questions;
                const payload = {
                    position: session.jobTitle,
                    averageScore: session.averageScore,
                    questions: previousQs.map(q => q.questionText),
                    answers: previousQs.map(q => q.userAnswer || ""),
                    scores: previousQs.map(q => q.aiScore || 0),
                    topics: previousQs.map(q => q.topic || "")
                };

                const overallFeedback = await n8nInterviewService.generateOverallFeedback(payload);

                session.overallFeedback = overallFeedback.overallFeedback || overallFeedback.feedback || '';
                session.strengths = overallFeedback.strengths || [];
                session.improvements = overallFeedback.weaknesses || overallFeedback.improvements || [];
                session.nextSteps = overallFeedback.nextSteps || [];
                // Có thể lưu recommendation vào DB nếu muốn, tạm thời lưu chung vào overallFeedback nếu model chưa hỗ trợ
                if (overallFeedback.recommendation) {
                    session.overallFeedback += `\n\nRecommendation: ${overallFeedback.recommendation}`;
                }
            } catch (err) {
                console.error("N8N Overall Feedback Error, falling back to local Groq if available:", err.message);
                if (groqClient) {
                    try {
                        const previousQs = session.questions;
                        const feedbackPrompt = `Bạn là nhà tuyển dụng nhân sự chuyên nghiệp cấp cao.
Hãy tổng hợp và đánh giá kết quả buổi phỏng vấn của ứng viên cho vị trí ${session.jobTitle}.

CHI TIẾT PHỎNG VẤN:
${previousQs.map((q, idx) => `Câu ${idx+1} (${q.topic}): 
Q: ${q.questionText}
A: ${q.userAnswer}
Score: ${q.aiScore}/100, Feedback: ${q.aiFeedback || 'N/A'}`).join('\n---\n')}

YÊUEU CAU:
1. Phân tích chi tiết từng câu hỏi - thấy được điểm mạnh/yếu
2. Feedback phải dài 5-6 câu, chi tiết, có cụ thể ví dụ
3. Strengths: 4-5 điểm mạnh nổi bật (3-4 từ mỗi điểm)
4. Improvements: 4-5 điểm cần cải thiện (3-4 từ mỗi điểm)
5. NextSteps: 4-5 hành động cụ thể (3-4 từ mỗi bước)
6. Recommendation: Strong Hire / Hire / Consider / No Hire

Trả về JSON thuần túy (không markdown):
{
  "feedback": "<5-6 câu phân tích chi tiết về năng lực, thái độ, kỹ năng, điểm mạnh/yếu cụ thể>",
  "strengths": ["<điểm mạnh 1 - 3-4 từ>", "<điểm mạnh 2 - 3-4 từ>", "<điểm mạnh 3 - 3-4 từ>", "<điểm mạnh 4 - 3-4 từ>", "<điểm mạnh 5 - 3-4 từ>"],
  "improvements": ["<cần cải 1 - 3-4 từ>", "<cần cải 2 - 3-4 từ>", "<cần cải 3 - 3-4 từ>", "<cần cải 4 - 3-4 từ>", "<cần cải 5 - 3-4 từ>"],
  "nextSteps": ["<hành động 1 - cụ thể>", "<hành động 2 - cụ thể>", "<hành động 3 - cụ thể>", "<hành động 4 - cụ thể>", "<hành động 5 - cụ thể>"],
  "recommendation": "Hire / Strong Hire / Consider / No Hire"
}`;
                        const rawFeedback = await groqClient.generateWithPrompt(feedbackPrompt);
                        const parsedFeedback = groqClient.parseJsonResponse(rawFeedback) || JSON.parse(rawFeedback);
                        
                        session.overallFeedback = parsedFeedback.feedback || parsedFeedback.overallFeedback || 'Đánh giá hoàn tất.';
                        session.strengths = (parsedFeedback.strengths || []).slice(0, 5);
                        session.improvements = (parsedFeedback.weaknesses || parsedFeedback.improvements || []).slice(0, 5);
                        session.nextSteps = (parsedFeedback.nextSteps || []).slice(0, 5);
                        if (parsedFeedback.recommendation) {
                            session.recommendation = parsedFeedback.recommendation;
                        }
                    } catch (groqErr) {
                        console.error("[GROQ OVERALL FEEDBACK ERROR] Lỗi khi gọi Groq để tổng hợp feedback:", groqErr.message);
                        // Enhanced fallback với feedback chi tiết hơn
                        const avgScore = session.averageScore || 0;
                        session.overallFeedback = `Ứng viên hoàn thành ${session.questions.length}/10 câu hỏi với điểm trung bình ${avgScore}/100. Ứng viên thể hiện sự tự tin trong giao tiếp nhưng cần trau dồi thêm kiến thức chuyên môn sâu hơn. Tính kỷ luật và thái độ làm việc tích cực là điểm sáng của ứng viên. Nên tiếp tục học hỏi và thực hành để nâng cao kỹ năng.`;
                        session.strengths = [
                            "Giao tiếp tự tin và rõ ràng",
                            "Có thái độ cầu thị, sẵn sàng học",
                            "Thể hiện sự tỉnh táo khi trả lời",
                            "Hoàn thành toàn bộ buổi phỏng vấn",
                            "Có kỷ luật trong thời gian trả lời"
                        ];
                        session.improvements = [
                            "Cần trau dồi kiến thức chuyên môn sâu",
                            "Cần có thêm ví dụ cụ thể từ kinh nghiệm",
                            "Nên chuẩn bị kỹ càng hơn cho những câu kỹ thuật",
                            "Cần phát triển khả năng tư duy hệ thống",
                            "Nên có thêm kinh nghiệm thực tế trong công việc"
                        ];
                        session.nextSteps = [
                            "Xem lại các câu hỏi đã trả lời không tốt để học hỏi",
                            "Luyện tập thêm các chủ đề kỹ thuật liên quan đến vị trí",
                            "Tham gia các khóa học nâng cao kỹ năng chuyên môn",
                            "Tìm cơ hội thực tập hoặc làm việc để tích lũy kinh nghiệm",
                            "Luyện tập phỏng vấn với bạn bè để tự tin hơn"
                        ];
                    }
                } else {
                    session.overallFeedback = "Phiên phỏng vấn hoàn tất. Điểm trung bình: " + session.averageScore;
                    session.strengths = ["Giao tiếp tự tin", "Có thái độ cầu thị"];
                    session.improvements = ["Cần trau dồi thêm kiến thức chuyên môn chi tiết"];
                    session.nextSteps = ["Xem lại các câu hỏi đã trả lời sai", "Luyện tập thêm các chủ đề kỹ thuật"];
                }
            }

            await session.save();

            // Update analytics
            await this.updateUserAnalytics(session.userId, session);

            return session;
        } catch (error) {
            throw new Error(`Không thể hoàn tất phiên phỏng vấn: ${error.message}`);
        }
    }

    /**
     * Cập nhật điểm số phiên hiện tại
     */
    async updateSessionScore(sessionId) {
        const session = await InterviewSession.findById(sessionId).populate('questions');
        const answeredQuestions = session.questions.filter((q) => q.aiScore !== null);

        if (answeredQuestions.length > 0) {
            const scores = answeredQuestions.map((q) => q.aiScore);
            session.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            session.answeredQuestions = answeredQuestions.length;
            await session.save();
        }
    }

    /**
     * Cập nhật analytics toàn bộ cho user
     */
    async updateUserAnalytics(userId, completedSession) {
        try {
            let analytics = await InterviewAnalytics.findOne({ userId });

            if (!analytics) {
                analytics = new InterviewAnalytics({ userId });
            }

            analytics.totalInterviews += 1;
            analytics.completedInterviews += 1;
            analytics.totalQuestionsAnswered += completedSession.answeredQuestions;
            analytics.lastInterviewDate = new Date();

            if (!analytics.firstInterviewDate) {
                analytics.firstInterviewDate = new Date();
            }

            // Update scores
            const allScores = [analytics.averageScore * (analytics.totalInterviews - 1), completedSession.averageScore];
            analytics.averageScore = Math.round(
                allScores.reduce((a, b) => a + b, 0) / analytics.totalInterviews
            );

            if (completedSession.averageScore > analytics.highestScore) {
                analytics.highestScore = completedSession.averageScore;
            }

            // Update category scores
            const category = completedSession.jobCategory;
            if (analytics.categoryScores[category] !== undefined) {
                analytics.categoryScores[category] = completedSession.averageScore;
            }

            // Update technical vs behavioral
            const questions = await InterviewQuestion.find({ sessionId: completedSession._id });
            const technicalQs = questions.filter((q) => q.questionType === 'Technical');
            const behavioralQs = questions.filter((q) => q.questionType === 'Behavioral');

            if (technicalQs.length > 0) {
                const techScores = technicalQs.map((q) => q.aiScore).filter((s) => s !== null);
                if (techScores.length > 0) {
                    analytics.technicalScore =
                        (analytics.technicalScore + techScores.reduce((a, b) => a + b, 0) / techScores.length) / 2;
                }
            }

            if (behavioralQs.length > 0) {
                const behScores = behavioralQs.map((q) => q.aiScore).filter((s) => s !== null);
                if (behScores.length > 0) {
                    analytics.behavioralScore =
                        (analytics.behavioralScore + behScores.reduce((a, b) => a + b, 0) / behScores.length) / 2;
                }
            }

            analytics.lastUpdatedAt = new Date();
            await analytics.save();

            return analytics;
        } catch (error) {
            console.error('Error updating analytics:', error);
        }
    }

    /**
     * Lấy chi tiết phiên phỏng vấn kèm tất cả câu hỏi
     */
    async getSessionDetails(sessionId) {
        try {
            const session = await InterviewSession.findById(sessionId).lean();
            if (!session) return null;
            const questions = await InterviewQuestion.find({ sessionId }).sort({ questionNumber: 1 }).lean();
            return { session, questions };
        } catch (error) {
            throw new Error(`Failed to fetch session details: ${error.message}`);
        }
    }

    /**
     * Lấy lịch sử phỏng vấn của user
     */
    async getInterviewHistory(userId, limit = 10, skip = 0) {
        try {
            const sessions = await InterviewSession.find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);

            const total = await InterviewSession.countDocuments({ userId });

            return { sessions, total };
        } catch (error) {
            throw new Error(`Failed to fetch history: ${error.message}`);
        }
    }

    /**
     * Lấy analytics của user
     */
    async getUserAnalytics(userId) {
        try {
            let analytics = await InterviewAnalytics.findOne({ userId });

            if (!analytics) {
                analytics = new InterviewAnalytics({ userId });
                await analytics.save();
            }

            return analytics;
        } catch (error) {
            throw new Error(`Failed to fetch analytics: ${error.message}`);
        }
    }

    /**
     * Private helper methods - Build prompts
     */
    buildQuestionPrompt(jobTitle, jobCategory, interviewType, jobDescription, questionNum, totalQuestions) {
        return `
Bạn là một nhân viên phỏng vấn chuyên gia cho vị trí: "${jobTitle}" trong lĩnh vực ${jobCategory}.
Hãy tạo câu hỏi số ${questionNum} trong ${totalQuestions} câu hỏi cho một cuộc phỏng vấn ${interviewType}.

Mô tả công việc: ${jobDescription || 'Không cung cấp'}

Yêu cầu:
- Tạo một câu hỏi rõ ràng, cụ thể và phù hợp với công việc
- Kết hợp giữa câu hỏi Kỹ thuật và Hành vi
- Trả về định dạng JSON: { "question": "...", "type": "Technical|Behavioral", "topic": "..." }
- Làm cho câu hỏi thách thức nhưng công bằng
- Liên quan đến mô tả công việc và vị trí tuyển dụng`;
    }

    buildEvaluationPrompt(question, questionType, userAnswer) {
        return `
Hãy đánh giá câu trả lời phỏng vấn này:
Câu hỏi (${questionType}): "${question}"
Câu trả lời của ứng viên: "${userAnswer}"

Cung cấp phản hồi dưới dạng JSON:
{
  "score": <0-100>,
  "feedback": "phản hồi chi tiết",
  "keyPoints": ["điểm quan trọng 1", "điểm quan trọng 2"],
  "missedPoints": ["những gì bị thiếu"],
  "suggestions": ["cách cải thiện"],
  "sentiment": "excellent|good|average|poor"
}`;
    }

    buildFollowUpPrompt(originalQuestion, userAnswer, missedPoints) {
        return `
Hãy tạo một câu hỏi tiếp theo dựa trên:
Câu hỏi gốc: "${originalQuestion}"
Câu trả lời của ứng viên: "${userAnswer}"
Những điểm bị thiếu: ${JSON.stringify(missedPoints)}

Trả về định dạng JSON: { "question": "..." }`;
    }

    buildOverallFeedbackPrompt(session, questions) {
        const questionsData = questions
            .map((q) => `Câu ${q.questionNumber} (${q.questionType}, Điểm: ${q.aiScore}): ${q.aiFeedback}`)
            .join('\n');

        return `
Hãy tóm tắt kết quả phỏng vấn:
Vị trí: ${session.jobTitle} (${session.jobCategory})
Điểm trung bình: ${session.averageScore}/100
Câu hỏi đã trả lời: ${session.answeredQuestions}/${session.totalQuestions}

Phản hồi chi tiết từng câu:
${questionsData}

Cung cấp phản hồi dưới dạng JSON:
{
  "feedback": "đánh giá tổng thể",
  "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
  "improvements": ["cải thiện 1", "cải thiện 2"],
  "nextSteps": ["bước tiếp theo 1", "bước tiếp theo 2"]
}`;
    }

    shouldGenerateFollowUp(score) {
        // Tạo follow-up nếu score từ 40-75 (cần cải thiện)
        return score >= 40 && score <= 75;
    }
}

export default new InterviewService();